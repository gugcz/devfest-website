import { useCallback, useEffect, useRef, useState } from 'react';
import logoUrl from '../assets/logo.png?url';
import samplePortraitUrl from '../assets/sample-portrait.svg?url';
import {
	CARD_SIZE,
	DEFAULT_TRANSFORM,
	WELL_SIZE,
	clampPan,
	coverScale,
	drawAttendingCard,
	panBounds,
	readFonts,
	readPalette,
	type Fonts,
	type Palette,
	type PhotoTransform,
} from '../lib/attending-card';
import s from './AttendingCard.module.scss';

/** Decodes the brand wordmark once, off the DOM. `decode()` resolves only
 * once pixels are ready, so a card can never export with the logo half-drawn
 * or missing because a `<canvas>` draw raced an `<img>` load. */
async function loadLogo(): Promise<HTMLImageElement> {
	const img = new Image();
	img.src = logoUrl;
	await img.decode();
	return img;
}

/** Decodes the bundled sample silhouette the same way as the logo, then hands
 * it off as an `ImageBitmap` — the same type a visitor's own photo decodes
 * to — so it runs through `drawAttendingCard`'s one photo pipeline
 * unmodified (cover-fit, vignette, pan/zoom math all identical). */
async function loadSamplePhoto(): Promise<ImageBitmap> {
	const img = new Image();
	img.src = samplePortraitUrl;
	await img.decode();
	return createImageBitmap(img);
}

const SAMPLE_NAME = 'Ada Lovelace';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
	'image/jpeg': 'JPG',
	'image/png': 'PNG',
	'image/webp': 'WEBP',
	'image/heic': 'HEIC',
	'image/heif': 'HEIF',
	'image/gif': 'GIF',
	'image/avif': 'AVIF',
	'image/bmp': 'BMP',
	'image/tiff': 'TIFF',
};

function extLabel(file: File): string {
	return EXT_BY_MIME[file.type] ?? file.name.split('.').pop()?.toUpperCase() ?? 'IMG';
}

const HEIC_MIME_RE = /^image\/hei[cf](-sequence)?$/;

/** Chromium reports HEIC/HEIF files as `type === ''`, so the mime check alone
 * would reject them before decode even gets a chance — the extension is the
 * only reliable signal there. */
function isHeicFile(file: File): boolean {
	return HEIC_MIME_RE.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

function formatSize(bytes: number): string {
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSigned(value: number): string {
	return value > 0 ? `+${value}` : `${value}`;
}

/** A native range's track fill is painted through a CSS custom property set
 * inline — it cascades into the `::-webkit-slider-runnable-track` /
 * `::-moz-range-track` pseudo-elements, which can't otherwise see a value
 * computed in JS. Zoom fills from the low edge; position rails are bipolar
 * and fill from the centre outward, or a left-edge fill would misread a
 * negative value as "less than half". */
function edgeFill(value: number, min: number, max: number): string {
	const pct = ((value - min) / (max - min)) * 100;
	return `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--rule-strong) ${pct}%, var(--rule-strong) 100%)`;
}

function centerFill(value: number, max: number): string {
	if (max <= 0) return `linear-gradient(to right, var(--rule-strong) 0%, var(--rule-strong) 100%)`;
	const pct = ((value + max) / (2 * max)) * 100;
	const start = Math.min(50, pct);
	const end = Math.max(50, pct);
	return `linear-gradient(to right, var(--rule-strong) 0%, var(--rule-strong) ${start}%, var(--color-accent) ${start}%, var(--color-accent) ${end}%, var(--rule-strong) ${end}%, var(--rule-strong) 100%)`;
}

type ShareState = 'idle' | 'working' | 'done' | 'error';

/** One authored SVG upload arrow — never an emoji or a glyph font. */
function UploadIcon() {
	return (
		<svg className={s.dropIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M12 16V5M12 5L6.5 10.5M12 5l5.5 5.5M4 19h16"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="square"
			/>
		</svg>
	);
}

/** Circled alert glyph for a rejected drop/pick — distinct from the upload
 * arrow so the tile visibly acknowledges the rejection before it resets. */
function AlertIcon() {
	return (
		<svg className={s.dropIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.25" />
			<line x1="12" y1="7.5" x2="12" y2="13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
			<circle cx="12" cy="16.25" r="0.85" fill="currentColor" />
		</svg>
	);
}

export default function AttendingCard() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const photoTriggerRef = useRef<HTMLButtonElement>(null);
	const [name, setName] = useState('');
	const [photo, setPhoto] = useState<ImageBitmap | null>(null);
	const [photoName, setPhotoName] = useState('');
	const [photoMeta, setPhotoMeta] = useState('');
	const [photoThumbUrl, setPhotoThumbUrl] = useState('');
	const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
	const [photoError, setPhotoError] = useState('');
	const [decoding, setDecoding] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);
	const [announcement, setAnnouncement] = useState('');
	const [shareState, setShareState] = useState<ShareState>('idle');
	const [shareMessage, setShareMessage] = useState('');
	const [assets, setAssets] = useState<{
		fonts: Fonts;
		palette: Palette;
		logo: HTMLImageElement | null;
		samplePhoto: ImageBitmap | null;
	} | null>(null);

	const dragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(
		null,
	);
	// Tracks the live bitmap so it can be `.close()`d on replace/unmount —
	// `photo` state lags one render behind the moment we need to release it.
	const photoRef = useRef<ImageBitmap | null>(null);
	// Same close-on-unmount need for the bundled sample bitmap.
	const sampleRef = useRef<ImageBitmap | null>(null);
	// Same lag problem for the thumbnail's object URL.
	const thumbUrlRef = useRef('');
	// Counts nested dragenter/dragleave pairs across the whole viewport — a
	// plain boolean flickers every time the drag crosses a child element.
	const dragDepthRef = useRef(0);

	// Astro's `fonts` integration self-hosts Bebas Neue / JetBrains Mono/
	// Special Elite behind CSS custom properties; `document.fonts.ready` is
	// the load signal for canvas text, which (unlike CSS) doesn't wait for
	// webfonts on its own. Colors are read from the same CSS custom
	// properties. Fonts, palette and the decoded logo are all gathered once
	// here, not per-draw: `getComputedStyle` forces a style recalc, and
	// `draw()` runs on every pointermove while panning. Waiting for the logo
	// too (not just fonts) is what keeps the very first draw — and so the
	// very first export, if a visitor is fast — from running without it.
	useEffect(() => {
		let cancelled = false;
		Promise.all([document.fonts.ready, loadLogo().catch(() => null), loadSamplePhoto().catch(() => null)]).then(
			([, logo, samplePhoto]) => {
				if (cancelled) {
					samplePhoto?.close();
					return;
				}
				sampleRef.current = samplePhoto;
				setAssets({ fonts: readFonts(), palette: readPalette(), logo, samplePhoto });
			},
		);
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		return () => {
			photoRef.current?.close();
			sampleRef.current?.close();
			if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current);
		};
	}, []);

	// With no photo picked yet, the card still renders — with the bundled
	// sample portrait and (unless the visitor already typed one) the sample
	// name — so the empty state reads as a finished card, not a blank form
	// field. `SAMPLE` badge + locked Download/Share are what mark it as a
	// preview; picking a real photo swaps both back to the visitor's own.
	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas || !assets) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const isSample = !photo;
		const cardPhoto = photo ?? assets.samplePhoto;
		const cardName = isSample ? name.trim() || SAMPLE_NAME : name;
		const cardTransform = isSample ? DEFAULT_TRANSFORM : transform;
		drawAttendingCard(
			ctx,
			{ name: cardName, photo: cardPhoto, transform: cardTransform },
			assets.fonts,
			assets.palette,
			assets.logo,
			{ isSample },
		);
	}, [name, photo, transform, assets]);

	useEffect(() => {
		draw();
	}, [draw]);

	const hasPhoto = photo !== null;
	useEffect(() => {
		if (hasPhoto) setAnnouncement('Framing controls added.');
	}, [hasPhoto]);

	// The affordance shows the moment a drag carrying files crosses the
	// viewport, not only once it's precisely over the tile or card — so the
	// listener lives on `window`, gated by a depth counter (a plain boolean
	// flickers on every child crossing). `dragover` must also stay
	// prevented everywhere, or a drop outside the two real targets makes the
	// browser navigate to the file instead of doing nothing.
	useEffect(() => {
		function hasFiles(e: DragEvent) {
			return Array.from(e.dataTransfer?.types ?? []).includes('Files');
		}
		function onDragEnter(e: DragEvent) {
			if (!hasFiles(e)) return;
			e.preventDefault();
			dragDepthRef.current += 1;
			setIsDragging(true);
		}
		function onDragOver(e: DragEvent) {
			if (!hasFiles(e)) return;
			e.preventDefault();
		}
		function onDragLeave(e: DragEvent) {
			if (!hasFiles(e)) return;
			dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
			if (dragDepthRef.current === 0) setIsDragging(false);
		}
		function onWindowDrop(e: DragEvent) {
			if (!hasFiles(e)) return;
			e.preventDefault();
			dragDepthRef.current = 0;
			setIsDragging(false);
		}
		window.addEventListener('dragenter', onDragEnter);
		window.addEventListener('dragover', onDragOver);
		window.addEventListener('dragleave', onDragLeave);
		window.addEventListener('drop', onWindowDrop);
		return () => {
			window.removeEventListener('dragenter', onDragEnter);
			window.removeEventListener('dragover', onDragOver);
			window.removeEventListener('dragleave', onDragLeave);
			window.removeEventListener('drop', onWindowDrop);
		};
	}, []);

	// Single validation path for both the picker and drag-and-drop — same
	// guards, same error strings, whichever route the file arrived by.
	async function processFile(file: File) {
		setPhotoError('');
		const heicLike = isHeicFile(file);
		if (!file.type.startsWith('image/') && !heicLike) {
			setPhotoError("That's not an image file. JPG, PNG, WebP or HEIC all work.");
			return;
		}
		if (file.size > MAX_PHOTO_BYTES) {
			setPhotoError(`That file is ${formatSize(file.size)} — the limit is 20 MB. Try a smaller export.`);
			return;
		}
		setDecoding(file.name);
		try {
			// Decoded fully client-side — the file never leaves the browser.
			// Safari/WebKit decode HEIC natively; everywhere else `createImageBitmap`
			// throws on it, so the libheif wasm fallback only loads for that case.
			let bitmap: ImageBitmap;
			// `<img>` can't render a HEIC blob URL on Chromium either, so the
			// thumbnail row needs the converted blob, not the original file.
			let thumbBlob: Blob = file;
			try {
				bitmap = await createImageBitmap(file);
			} catch (err) {
				if (!heicLike) throw err;
				const { heicTo } = await import('heic-to/csp');
				const converted = await heicTo({ blob: file, type: 'image/png' });
				thumbBlob = converted;
				bitmap = await createImageBitmap(converted);
			}
			if (bitmap.width === 0 || bitmap.height === 0) {
				bitmap.close();
				setDecoding('');
				setPhotoError("Couldn't read that image. Try a different file.");
				return;
			}
			photoRef.current?.close();
			photoRef.current = bitmap;
			if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current);
			const thumbUrl = URL.createObjectURL(thumbBlob);
			thumbUrlRef.current = thumbUrl;
			setPhoto(bitmap);
			setPhotoName(file.name);
			setPhotoMeta(`${extLabel(file)} · ${formatSize(file.size)} · ${bitmap.width}×${bitmap.height}`);
			setPhotoThumbUrl(thumbUrl);
			setTransform(DEFAULT_TRANSFORM);
			setDecoding('');
		} catch {
			setDecoding('');
			setPhotoError("Couldn't read that image. Try a different file.");
		}
	}

	async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = ''; // allow re-selecting the same file later
		if (!file) return;
		await processFile(file);
	}

	async function handleDrop(event: React.DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		dragDepthRef.current = 0;
		setIsDragging(false);
		const file = event.dataTransfer.files?.[0];
		if (!file) return;
		await processFile(file);
	}

	function triggerPhotoPick() {
		fileInputRef.current?.click();
	}

	function removePhoto() {
		photoRef.current?.close();
		photoRef.current = null;
		if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current);
		thumbUrlRef.current = '';
		setPhoto(null);
		setPhotoName('');
		setPhotoMeta('');
		setPhotoThumbUrl('');
		setTransform(DEFAULT_TRANSFORM);
		setPhotoError('');
		// The button that was just clicked unmounts with the picked-state block;
		// move focus to its replacement so it doesn't silently drop to <body>.
		requestAnimationFrame(() => photoTriggerRef.current?.focus());
	}

	function updateZoom(zoom: number) {
		setTransform((prev) => {
			if (!photo) return { ...prev, zoom };
			const scale = coverScale(photo.width, photo.height, WELL_SIZE) * zoom;
			const clamped = clampPan(prev.panX, prev.panY, photo.width, photo.height, scale, WELL_SIZE);
			return { zoom, ...clamped };
		});
	}

	function updatePan(panX: number, panY: number) {
		setTransform((prev) => {
			if (!photo) return prev;
			const scale = coverScale(photo.width, photo.height, WELL_SIZE) * prev.zoom;
			return { ...prev, ...clampPan(panX, panY, photo.width, photo.height, scale, WELL_SIZE) };
		});
	}

	// Pan by dragging directly on the preview canvas. Deltas arrive in CSS
	// pixels (the canvas is drawn at 1200×1200 but displayed smaller), so
	// they're scaled up to canvas-space before being applied.
	function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
		if (!photo) return;
		const canvas = event.currentTarget;
		canvas.setPointerCapture(event.pointerId);
		dragRef.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			panX: transform.panX,
			panY: transform.panY,
		};
	}

	function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId || !photo) return;
		const canvas = event.currentTarget;
		const displayScale = CARD_SIZE / canvas.getBoundingClientRect().width;
		const scale = coverScale(photo.width, photo.height, WELL_SIZE) * transform.zoom;
		const dCanvasX = (event.clientX - drag.startX) * displayScale;
		const dCanvasY = (event.clientY - drag.startY) * displayScale;
		const clamped = clampPan(
			drag.panX + dCanvasX / scale,
			drag.panY + dCanvasY / scale,
			photo.width,
			photo.height,
			scale,
			WELL_SIZE,
		);
		setTransform((prev) => ({ ...prev, ...clamped }));
	}

	function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
		if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
	}

	function toBlob(): Promise<Blob | null> {
		return new Promise((resolve) => canvasRef.current?.toBlob((blob) => resolve(blob), 'image/png'));
	}

	async function handleDownload() {
		const blob = await toBlob();
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'devfest-cz-2026.png';
		document.body.appendChild(a);
		a.click();
		a.remove();
		// Revoking synchronously right after `click()` can cancel the download
		// in Safari/Firefox — the browser hasn't necessarily read the blob URL
		// yet. Give it a beat first.
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async function handleShare() {
		setShareState('working');
		setShareMessage('');
		try {
			const blob = await toBlob();
			if (!blob) throw new Error('no-blob');
			const file = new File([blob], 'devfest-cz-2026.png', { type: 'image/png' });
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: 'DevFest.cz 2026',
					text: "I'm attending DevFest.cz 2026!",
				});
				setShareState('done');
				setShareMessage('Shared.');
			} else {
				await handleDownload();
				setShareState('done');
				setShareMessage('Sharing isn’t supported here — downloaded instead.');
			}
		} catch (err) {
			// AbortError = the visitor cancelled the native share sheet — not a failure.
			if ((err as { name?: string }).name === 'AbortError') {
				setShareState('idle');
				return;
			}
			setShareState('error');
			setShareMessage('Could not share. Try downloading instead.');
		}
	}

	const nameEmpty = name.trim().length === 0;
	const exportDisabled = nameEmpty || !hasPhoto || shareState === 'working';
	const cardLabel = nameEmpty
		? 'Your DevFest.cz 2026 share card preview'
		: `Your DevFest.cz 2026 share card preview, ${name.trim()}`;

	const panRange = photo
		? panBounds(photo.width, photo.height, coverScale(photo.width, photo.height, WELL_SIZE) * transform.zoom, WELL_SIZE)
		: null;

	const nameFilled = !nameEmpty;
	const photoFilled = hasPhoto;

	return (
		<div className={s.wrapper}>
			<div className={s.steps}>
				<section className={s.step} aria-labelledby="attending-step-1-head">
					<div className={s.stepGutter} aria-hidden="true">
						<span className={s.stepNumeral} data-filled={nameFilled}>01</span>
						<span className={s.stepSpine} data-filled={nameFilled} />
					</div>
					<div className={s.stepBody}>
						<div className={s.stepHead} id="attending-step-1-head">
							<span className={s.stepHeadText}>Your name</span>
							<span className={s.statusWord} data-tone="required">Required</span>
						</div>
						<div className={s.nameFieldWrap}>
							<input
								className={s.input}
								type="text"
								maxLength={40}
								value={name}
								onChange={(e) => setName(e.target.value)}
								autoComplete="name"
								aria-labelledby="attending-step-1-head"
								aria-describedby="attending-name-hint"
							/>
							<span className={s.counter} data-emphasis={name.length >= 36}>
								{name.length}/40
							</span>
						</div>
						<span id="attending-name-hint" className={s.hint}>
							It goes on the card, so spell it the way you'd want it read out loud.
						</span>
					</div>
				</section>

				<section className={s.step} aria-labelledby="attending-step-2-head">
					<div className={s.stepGutter} aria-hidden="true">
						<span className={s.stepNumeral} data-filled={photoFilled}>02</span>
						<span className={s.stepSpine} data-filled={photoFilled} />
					</div>
					<div className={s.stepBody}>
						<div className={s.stepHead} id="attending-step-2-head">
							<span className={s.stepHeadText}>Your photo</span>
							<span className={s.statusWord} data-tone="required">Required</span>
						</div>

						<input
							ref={fileInputRef}
							className={s.srOnly}
							id="attending-photo-input"
							type="file"
							accept="image/*"
							tabIndex={-1}
							onChange={handlePhotoChange}
							aria-describedby="attending-photo-hint"
							aria-labelledby="attending-step-2-head"
						/>

						{isDragging ? (
							<div
								className={s.dropzone}
								data-state="drag"
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
							>
								<UploadIcon />
								<span className={s.dropLabel}>Let go</span>
							</div>
						) : photo ? (
							<div className={s.photoRow} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
								{photoThumbUrl && <img className={s.photoThumb} src={photoThumbUrl} alt="" />}
								<div className={s.photoInfo}>
									<span className={s.photoName}>{photoName}</span>
									<span className={s.photoMeta}>{photoMeta}</span>
								</div>
								<div className={s.photoActions}>
									<button
										type="button"
										className={s.linkButton}
										onClick={triggerPhotoPick}
										aria-controls="attending-photo-input"
									>
										Replace
									</button>
									<button
										type="button"
										className={s.linkButton}
										onClick={removePhoto}
										aria-controls="attending-photo-input"
									>
										Remove
									</button>
								</div>
							</div>
						) : decoding ? (
							<div className={s.photoRow}>
								<span className={s.photoThumbPlaceholder} aria-hidden="true" />
								<div className={s.photoInfo}>
									<span className={s.photoName}>{decoding}</span>
								</div>
							</div>
						) : (
							<div
								className={s.dropzone}
								data-state="empty"
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
							>
								{photoError ? <AlertIcon /> : <UploadIcon />}
								<span className={s.dropLabel}>Drop a photo</span>
								<span className={s.dropOr}>or</span>
								<button
									ref={photoTriggerRef}
									type="button"
									className={s.chooseButton}
									onClick={triggerPhotoPick}
									aria-controls="attending-photo-input"
								>
									Choose file
								</button>
							</div>
						)}

						<span id="attending-photo-hint" className={s.hint}>
							Never uploaded — your browser does the whole thing.
						</span>

						{photoError && (
							<p className={s.error} role="alert">
								{photoError}
							</p>
						)}
					</div>
				</section>

				{photo && panRange && (
					<section className={`${s.step} ${s.stepEnter}`} aria-labelledby="attending-step-3-head">
						<div className={s.stepGutter} aria-hidden="true">
							<span className={s.stepNumeral} data-filled="true">03</span>
							<span className={s.stepSpine} data-filled="false" />
						</div>
						<div className={s.stepBody}>
							<div className={s.stepHead} id="attending-step-3-head">
								<span className={s.stepHeadText}>Framing</span>
							</div>

							<div className={s.rail} data-disabled={false}>
								<div className={s.railHead}>
									<span className={s.railLabel}>Zoom</span>
									<span className={s.railReadout}>{transform.zoom.toFixed(2)}×</span>
								</div>
								<div className={s.railTrackWrap}>
									<input
										className={s.range}
										type="range"
										min={MIN_ZOOM}
										max={MAX_ZOOM}
										step={0.01}
										value={transform.zoom}
										onChange={(e) => updateZoom(Number(e.target.value))}
										style={{ '--fill': edgeFill(transform.zoom, MIN_ZOOM, MAX_ZOOM) } as React.CSSProperties}
										aria-label="Zoom"
										aria-valuetext={`${transform.zoom.toFixed(2)}×`}
									/>
								</div>
							</div>

							<div className={s.rail} data-disabled={panRange.maxX === 0}>
								<div className={s.railHead}>
									<span className={s.railLabel}>Left / Right</span>
									<span className={s.railReadout}>{formatSigned(transform.panX)}</span>
								</div>
								<div className={s.railTrackWrap}>
									<input
										className={s.range}
										type="range"
										min={-panRange.maxX}
										max={panRange.maxX}
										step={1}
										disabled={panRange.maxX === 0}
										value={transform.panX}
										onChange={(e) => updatePan(Number(e.target.value), transform.panY)}
										style={{ '--fill': centerFill(transform.panX, panRange.maxX) } as React.CSSProperties}
										aria-label="Position, left and right"
										aria-valuetext={formatSigned(transform.panX)}
									/>
									<span className={s.centerTick} aria-hidden="true" />
								</div>
							</div>

							<div className={s.rail} data-disabled={panRange.maxY === 0}>
								<div className={s.railHead}>
									<span className={s.railLabel}>Up / Down</span>
									<span className={s.railReadout}>{formatSigned(transform.panY)}</span>
								</div>
								<div className={s.railTrackWrap}>
									<input
										className={s.range}
										type="range"
										min={-panRange.maxY}
										max={panRange.maxY}
										step={1}
										disabled={panRange.maxY === 0}
										value={transform.panY}
										onChange={(e) => updatePan(transform.panX, Number(e.target.value))}
										style={{ '--fill': centerFill(transform.panY, panRange.maxY) } as React.CSSProperties}
										aria-label="Position, up and down"
										aria-valuetext={formatSigned(transform.panY)}
									/>
									<span className={s.centerTick} aria-hidden="true" />
								</div>
							</div>

							<span className={s.hint}>Or just drag the photo on the card.</span>
						</div>
					</section>
				)}

				<span className={s.srOnly} role="status" aria-live="polite">
					{announcement}
				</span>
			</div>

			<div className={s.preview}>
				<div
					className={s.cardWrap}
					onDragOver={(e) => e.preventDefault()}
					onDrop={handleDrop}
					data-dragging={isDragging}
				>
					<canvas
						ref={canvasRef}
						width={CARD_SIZE}
						height={CARD_SIZE}
						className={s.canvas}
						role="img"
						aria-label={cardLabel}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerCancel={handlePointerUp}
						data-draggable={photo ? 'true' : 'false'}
					/>
					{isDragging && (
						<div className={s.dragOverlay} aria-hidden="true">
							<span>Drop to replace</span>
						</div>
					)}
				</div>

				<div className={s.actions}>
					<button
						type="button"
						className="btn-primary"
						onClick={handleDownload}
						disabled={exportDisabled}
						aria-describedby={!hasPhoto ? 'attending-download-hint' : undefined}
					>
						Download PNG
					</button>
					<button type="button" className="btn-ghost" onClick={handleShare} disabled={exportDisabled}>
						{shareState === 'working' ? 'Sharing…' : 'Share'}
					</button>
				</div>

				{!hasPhoto && (
					<p id="attending-download-hint" className={s.hint}>
						Upload a photo to enable the download.
					</p>
				)}

				<p className={s.message} role="status" aria-live="polite" data-tone={shareState === 'error' ? 'error' : 'info'}>
					{shareMessage}
				</p>
			</div>
		</div>
	);
}
