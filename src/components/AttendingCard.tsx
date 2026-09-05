import { useCallback, useEffect, useRef, useState } from 'react';
import logoUrl from '../assets/logo.png?url';
import {
	CARD_SIZE,
	DEFAULT_TRANSFORM,
	ROLES,
	WELL_SIZE,
	clampPan,
	coverScale,
	drawAttendingCard,
	panBounds,
	readFonts,
	readPalette,
	type AttendingRole,
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

type ShareState = 'idle' | 'working' | 'done' | 'error';

export default function AttendingCard() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [name, setName] = useState('');
	const [role, setRole] = useState<AttendingRole>('Attendee');
	const [photo, setPhoto] = useState<ImageBitmap | null>(null);
	const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
	const [photoError, setPhotoError] = useState('');
	const [shareState, setShareState] = useState<ShareState>('idle');
	const [shareMessage, setShareMessage] = useState('');
	const [assets, setAssets] = useState<{ fonts: Fonts; palette: Palette; logo: HTMLImageElement | null } | null>(
		null,
	);

	const dragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(
		null,
	);
	// Tracks the live bitmap so it can be `.close()`d on replace/unmount —
	// `photo` state lags one render behind the moment we need to release it.
	const photoRef = useRef<ImageBitmap | null>(null);

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
		Promise.all([document.fonts.ready, loadLogo().catch(() => null)]).then(([, logo]) => {
			if (cancelled) return;
			setAssets({ fonts: readFonts(), palette: readPalette(), logo });
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		return () => {
			photoRef.current?.close();
		};
	}, []);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas || !assets) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		drawAttendingCard(ctx, { name, role, photo, transform }, assets.fonts, assets.palette, assets.logo);
	}, [name, role, photo, transform, assets]);

	useEffect(() => {
		draw();
	}, [draw]);

	async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = ''; // allow re-selecting the same file later
		if (!file) return;
		setPhotoError('');
		if (!file.type.startsWith('image/')) {
			setPhotoError('Please choose an image file.');
			return;
		}
		if (file.size > MAX_PHOTO_BYTES) {
			setPhotoError('That image is too large (max 20 MB).');
			return;
		}
		try {
			// Decoded fully client-side — the file never leaves the browser.
			const bitmap = await createImageBitmap(file);
			if (bitmap.width === 0 || bitmap.height === 0) {
				bitmap.close();
				setPhotoError("Couldn't read that image. Try a different file.");
				return;
			}
			photoRef.current?.close();
			photoRef.current = bitmap;
			setPhoto(bitmap);
			setTransform(DEFAULT_TRANSFORM);
		} catch {
			setPhotoError("Couldn't read that image. Try a different file.");
		}
	}

	function removePhoto() {
		photoRef.current?.close();
		photoRef.current = null;
		setPhoto(null);
		setTransform(DEFAULT_TRANSFORM);
		setPhotoError('');
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
		a.download = `devfest-cz-2026-${role.toLowerCase()}.png`;
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
			const file = new File([blob], `devfest-cz-2026-${role.toLowerCase()}.png`, { type: 'image/png' });
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
	const exportDisabled = nameEmpty || shareState === 'working';
	const cardLabel = nameEmpty
		? `Your DevFest.cz 2026 share card preview, ${role.toLowerCase()}`
		: `Your DevFest.cz 2026 share card preview, ${name.trim()}, ${role.toLowerCase()}`;

	const panRange = photo
		? panBounds(photo.width, photo.height, coverScale(photo.width, photo.height, WELL_SIZE) * transform.zoom, WELL_SIZE)
		: null;

	return (
		<div className={s.wrapper}>
			<div className={s.form}>
				<label className={s.field}>
					<span className={s.label}>Your name</span>
					<input
						className={s.input}
						type="text"
						maxLength={40}
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="name"
						aria-describedby="attending-name-hint"
					/>
				</label>
				<span id="attending-name-hint" className={s.hint}>
					Required to download or share — it's your card, after all.
				</span>

				<fieldset className={s.roleField}>
					<legend className={s.label}>You're attending as</legend>
					<div className={s.roleGroup}>
						{ROLES.map((r) => (
							<label key={r} className={s.roleOption} data-active={role === r}>
								<input
									type="radio"
									name="attending-role"
									value={r}
									checked={role === r}
									onChange={() => setRole(r)}
								/>
								{r}
							</label>
						))}
					</div>
				</fieldset>

				<label className={s.field}>
					<span className={s.label}>Photo (optional)</span>
					<input
						className={s.fileInput}
						type="file"
						accept="image/*"
						onChange={handlePhotoChange}
						aria-describedby="attending-photo-hint"
					/>
				</label>
				<span id="attending-photo-hint" className={s.hint}>
					Processed entirely in your browser — never uploaded anywhere. No photo? We'll use your initials instead.
				</span>

				{photoError && (
					<p className={s.error} role="alert">
						{photoError}
					</p>
				)}

				{photo && panRange && (
					<div className={s.field}>
						<span className={s.label}>Zoom</span>
						<input
							className={s.range}
							type="range"
							min={MIN_ZOOM}
							max={MAX_ZOOM}
							step={0.01}
							value={transform.zoom}
							onChange={(e) => updateZoom(Number(e.target.value))}
						/>
						<span className={s.label}>Position — left/right</span>
						<input
							className={s.range}
							type="range"
							min={-panRange.maxX}
							max={panRange.maxX}
							step={1}
							disabled={panRange.maxX === 0}
							value={transform.panX}
							onChange={(e) => updatePan(Number(e.target.value), transform.panY)}
						/>
						<span className={s.label}>Position — up/down</span>
						<input
							className={s.range}
							type="range"
							min={-panRange.maxY}
							max={panRange.maxY}
							step={1}
							disabled={panRange.maxY === 0}
							value={transform.panY}
							onChange={(e) => updatePan(transform.panX, Number(e.target.value))}
						/>
						<span className={s.hint}>Drag the photo above to reposition it, or use the sliders.</span>
						<button type="button" className={s.linkButton} onClick={removePhoto}>
							Remove photo
						</button>
					</div>
				)}
			</div>

			<div className={s.preview}>
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

				<div className={s.actions}>
					<button type="button" className="btn-primary" onClick={handleDownload} disabled={exportDisabled}>
						Download PNG
					</button>
					<button type="button" className="btn-ghost" onClick={handleShare} disabled={exportDisabled}>
						{shareState === 'working' ? 'Sharing…' : 'Share'}
					</button>
				</div>

				<p className={s.message} role="status" aria-live="polite" data-tone={shareState === 'error' ? 'error' : 'info'}>
					{shareMessage}
				</p>
			</div>
		</div>
	);
}
