import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// Mono white: the manual's only logo version on a red field.
import logoUrl from '../assets/logo-mono-white.png?url';
import {
	CARD_SIZE,
	DEFAULT_TRANSFORM,
	WELL_SIZE,
	clampPan,
	coverScale,
	readFonts,
	readPalette,
	type Fonts,
	type Palette,
	type PhotoTransform,
} from '../lib/attending-card';
import { drawSpeakerCard } from '../lib/speaker-card';
import { fetchLineup } from '../lib/lineup';
import { initials, type Speaker } from '../lib/speakers';
import { useRemote } from '../lib/useRemote';
import { EmptyState, ErrorState, LoadingState } from './DataState';
import a from './AttendingCard.module.scss';
import s from './SpeakerCard.module.scss';

/** The speaker's share card: their name and talk title on a poster of its
 * own (`speaker-card.ts`), sharing the `/attending` builder's photo pipeline
 * and styles. Lives on an unlisted page — see `speaker-card.astro`. */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

async function loadImage(src: string): Promise<HTMLImageElement> {
	const img = new Image();
	img.src = src;
	await img.decode();
	return img;
}

/** Stand-in "photo" when the speaker has none (or it won't load): initials on
 * the panel tone, run through the same photo pipeline as a real portrait. */
function monogramBitmap(name: string, fonts: Fonts, palette: Palette): Promise<ImageBitmap> {
	const canvas = document.createElement('canvas');
	canvas.width = CARD_SIZE;
	canvas.height = CARD_SIZE;
	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.fillStyle = palette.panel;
		ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);
		ctx.fillStyle = palette.monogramInk;
		ctx.font = `420px ${fonts.bebas}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(initials(name), CARD_SIZE / 2, CARD_SIZE / 2 + 20);
	}
	return createImageBitmap(canvas);
}

async function decodeFile(file: File): Promise<ImageBitmap> {
	try {
		return await createImageBitmap(file);
	} catch (err) {
		// Chromium can't decode HEIC; same lazy fallback as `/attending`.
		if (!/^image\/hei[cf]/.test(file.type) && !/\.hei[cf]$/i.test(file.name)) throw err;
		const { heicTo } = await import('heic-to/csp');
		return createImageBitmap(await heicTo({ blob: file, type: 'image/png' }));
	}
}

function slug(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

type ShareState = 'idle' | 'working' | 'done' | 'error';
type PhotoSource = 'speaker' | 'upload' | 'monogram';

function photoNoteFor(photoLoading: boolean, photoSource: PhotoSource): string {
	return photoLoading
		? 'Fetching your photo…'
		: photoSource === 'speaker'
			? 'Your Sessionize photo. Drag it on the card to frame it.'
			: photoSource === 'upload'
				? 'Your own photo, processed on your device only. Drag it on the card to frame it.'
				: 'No photo we can use, so your initials carry the card. Add your own below.';
}

function cardLabelFor(speaker: Speaker | undefined, talk: string): string {
	return speaker
		? `DevFest.cz 2026 speaker card for ${speaker.fullName}${talk ? `, ${talk}` : ''}`
		: 'DevFest.cz 2026 speaker card preview';
}

export default function SpeakerCard() {
	const { status, data } = useRemote(fetchLineup, 'speaker-card', (l) => l.speakers.length === 0);
	const speakers = useMemo(
		() =>
			(data?.speakers ?? [])
				.filter((sp) => sp.fullName.trim())
				.sort((x, y) => x.fullName.localeCompare(y.fullName, 'cs')),
		[data],
	);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(
		null,
	);
	const [speakerId, setSpeakerId] = useState('');
	const [talkIndex, setTalkIndex] = useState(0);
	const [photo, setPhoto] = useState<ImageBitmap | null>(null);
	const [photoSource, setPhotoSource] = useState<PhotoSource>('monogram');
	const [photoError, setPhotoError] = useState('');
	// True while a speaker's photo downloads or an upload decodes: the proxy
	// can take seconds on a cold start, and HEIC decodes slowly on phones.
	const [photoLoading, setPhotoLoading] = useState(false);
	const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM);
	const [shareState, setShareState] = useState<ShareState>('idle');
	// Bumped once the latin-ext glyphs for the current text have loaded.
	const [glyphsReady, setGlyphsReady] = useState(0);
	const [shareMessage, setShareMessage] = useState('');
	const [assets, setAssets] = useState<{ fonts: Fonts; palette: Palette; logo: HTMLImageElement | null } | null>(
		null,
	);

	const speaker: Speaker | undefined = speakers.find((sp) => sp.id === speakerId);
	const talks = speaker?.sessions.filter((t) => t.name.trim()) ?? [];
	const talk = talks[talkIndex]?.name ?? '';

	useEffect(() => {
		let cancelled = false;
		Promise.all([document.fonts.ready, loadImage(logoUrl).catch(() => null)]).then(([, logo]) => {
			if (!cancelled) setAssets({ fonts: readFonts(), palette: readPalette(), logo });
		});
		return () => {
			cancelled = true;
		};
	}, []);

	function replacePhoto(next: ImageBitmap | null, source: PhotoSource) {
		setPhoto(next);
		setPhotoSource(source);
		setTransform(DEFAULT_TRANSFORM);
	}

	// Picking a speaker loads their Sessionize photo; no photo, or a host that
	// won't allow a canvas read, lands on the monogram (a `?` before a pick).
	useEffect(() => {
		if (!assets) return;
		let cancelled = false;
		setPhotoError('');
		setPhotoLoading(Boolean(speaker?.profilePicture));
		const load = speaker?.profilePicture
			? // Same-origin proxy of the lineup photo (`speakerPhotoApi`): the
				// Storage mirror needs App Check and Sessionize sends no CORS, and
				// either would leave the canvas unexportable.
				loadImage(`/api/speaker-photo?id=${encodeURIComponent(speaker.id)}`)
					.then((img) => createImageBitmap(img))
					.then((bitmap) => ({ bitmap, source: 'speaker' as const }))
			: Promise.reject(new Error('no-photo'));
		load
			.catch(async () => ({
				bitmap: await monogramBitmap(speaker?.fullName ?? '', assets.fonts, assets.palette),
				source: 'monogram' as const,
			}))
			.then(({ bitmap, source }) => {
				if (cancelled) {
					bitmap.close();
					return;
				}
				replacePhoto(bitmap, source);
				setPhotoLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [speaker?.id, assets]);

	// Frees a bitmap once a newer one is committed (or on unmount). Not on
	// replace: an effect from the render before still draws the old bitmap,
	// and drawing a closed one throws and takes the island down.
	useEffect(() => () => photo?.close(), [photo]);

	const draw = useCallback(() => {
		const ctx = canvasRef.current?.getContext('2d');
		if (!ctx || !assets) return;
		drawSpeakerCard(
			ctx,
			{ name: speaker?.fullName ?? '', talk: speaker ? talk : 'Your talk title', photo, transform },
			assets.fonts,
			assets.palette,
			assets.logo,
		);
	}, [speaker, talk, photo, transform, assets, glyphsReady]);

	useEffect(() => {
		draw();
	}, [draw]);

	// The latin-ext halves of the faces are `unicode-range` subsets that load
	// only when something on the page uses them, and canvas text never asks —
	// so a Czech name or title would draw its accents in a fallback face.
	// Load them for this exact text, then redraw.
	useEffect(() => {
		if (!assets) return;
		let cancelled = false;
		const text = `${speaker?.fullName ?? ''} ${talk}`;
		Promise.all([
			document.fonts.load(`100px ${assets.fonts.bebas}`, text.toLocaleUpperCase('cs-CZ')),
			document.fonts.load(`500 44px ${assets.fonts.mono}`, text.toLocaleUpperCase('cs-CZ')),
		])
			.catch(() => undefined)
			.then(() => {
				if (!cancelled) setGlyphsReady((n) => n + 1);
			});
		return () => {
			cancelled = true;
		};
	}, [speaker?.fullName, talk, assets]);

	async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		setPhotoError('');
		if (file.size > MAX_PHOTO_BYTES) {
			setPhotoError('That file is over 20 MB. Try a smaller export.');
			return;
		}
		setPhotoLoading(true);
		try {
			replacePhoto(await decodeFile(file), 'upload');
		} catch {
			setPhotoError("Couldn't read that image. JPG, PNG, WebP or HEIC all work.");
		} finally {
			setPhotoLoading(false);
		}
	}

	function updateZoom(zoom: number) {
		setTransform((prev) => {
			if (!photo) return { ...prev, zoom };
			const scale = coverScale(photo.width, photo.height, WELL_SIZE) * zoom;
			return { zoom, ...clampPan(prev.panX, prev.panY, photo.width, photo.height, scale, WELL_SIZE) };
		});
	}

	function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
		if (!photo || photoSource === 'monogram') return;
		event.currentTarget.setPointerCapture(event.pointerId);
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
		const displayScale = CARD_SIZE / event.currentTarget.getBoundingClientRect().width;
		const scale = coverScale(photo.width, photo.height, WELL_SIZE) * transform.zoom;
		const clamped = clampPan(
			drag.panX + ((event.clientX - drag.startX) * displayScale) / scale,
			drag.panY + ((event.clientY - drag.startY) * displayScale) / scale,
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

	const fileName = `devfest-cz-2026-${slug(speaker?.fullName ?? '') || 'speaker'}.png`;

	function toBlob(): Promise<Blob | null> {
		return new Promise((resolve) => canvasRef.current?.toBlob((blob) => resolve(blob), 'image/png'));
	}

	async function handleDownload() {
		const blob = await toBlob();
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async function handleShare() {
		setShareState('working');
		setShareMessage('');
		try {
			const blob = await toBlob();
			if (!blob) throw new Error('no-blob');
			const file = new File([blob], fileName, { type: 'image/png' });
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({ files: [file], title: 'DevFest.cz 2026', text: "I'm speaking at DevFest.cz 2026!" });
				setShareState('done');
				setShareMessage('Shared.');
			} else {
				await handleDownload();
				setShareState('done');
				setShareMessage('Sharing isn’t supported here — downloaded instead.');
			}
		} catch (err) {
			if ((err as { name?: string }).name === 'AbortError') {
				setShareState('idle');
				return;
			}
			setShareState('error');
			setShareMessage('Could not share. Try downloading instead.');
		}
	}

	if (status === 'loading') return <LoadingState label="Loading speakers" />;
	if (status === 'error' && speakers.length === 0) {
		return (
			<ErrorState>
				<p>The speaker list isn’t coming up right now. Try again in a minute.</p>
			</ErrorState>
		);
	}
	if (speakers.length === 0) {
		return (
			<EmptyState>
				<p>No speakers announced yet.</p>
			</EmptyState>
		);
	}

	const exportDisabled = !speaker || !photo || photoLoading || shareState === 'working';
	const photoNote = photoNoteFor(photoLoading, photoSource);

	return (
		<div className={a.wrapper}>
			<div className={a.steps}>
				<section className={a.step} aria-labelledby="speaker-step-1-head">
					<div className={a.stepGutter} aria-hidden="true">
						<span className={a.stepNumeral} data-filled={!!speaker}>
							01
						</span>
						<span className={a.stepSpine} data-filled={!!speaker} />
					</div>
					<div className={a.stepBody}>
						<label className={a.stepHead} id="speaker-step-1-head" htmlFor="speaker-select">
							<span className={a.stepHeadText}>Who are you?</span>
						</label>
						<select
							id="speaker-select"
							className={s.select}
							value={speakerId}
							onChange={(e) => {
								setSpeakerId(e.target.value);
								setTalkIndex(0);
								setShareState('idle');
								setShareMessage('');
							}}
						>
							<option value="">Pick your name…</option>
							{speakers.map((sp) => (
								<option key={sp.id} value={sp.id}>
									{sp.fullName}
								</option>
							))}
						</select>
					</div>
				</section>

				{talks.length > 1 && (
					<section className={a.step} aria-labelledby="speaker-step-2-head">
						<div className={a.stepGutter} aria-hidden="true">
							<span className={a.stepNumeral} data-filled="true">
								02
							</span>
							<span className={a.stepSpine} data-filled="true" />
						</div>
						<div className={a.stepBody}>
							<label className={a.stepHead} id="speaker-step-2-head" htmlFor="speaker-talk">
								<span className={a.stepHeadText}>Which talk?</span>
							</label>
							<select
								id="speaker-talk"
								className={s.select}
								value={talkIndex}
								onChange={(e) => setTalkIndex(Number(e.target.value))}
							>
								{talks.map((t, i) => (
									<option key={t.name} value={i}>
										{t.name}
									</option>
								))}
							</select>
							<span className={a.hint}>You're giving more than one, so make a card for each.</span>
						</div>
					</section>
				)}

				{speaker && (
					<section className={a.step} aria-labelledby="speaker-step-photo-head">
						<div className={a.stepGutter} aria-hidden="true">
							<span className={a.stepNumeral} data-filled="true">
								{talks.length > 1 ? '03' : '02'}
							</span>
							<span className={a.stepSpine} data-filled="false" />
						</div>
						<div className={a.stepBody}>
							<div className={a.stepHead} id="speaker-step-photo-head">
								<span className={a.stepHeadText}>Photo</span>
								<span className={a.statusWord} data-tone="optional">
									Optional
								</span>
							</div>
							<p className={s.note}>{photoNote}</p>

							<input
								ref={fileInputRef}
								className="sr-only"
								id="speaker-photo-input"
								type="file"
								accept="image/*"
								tabIndex={-1}
								onChange={handlePhotoChange}
								aria-labelledby="speaker-step-photo-head"
							/>
							<div className={s.photoButtons}>
								<button
									type="button"
									className={a.chooseButton}
									onClick={() => fileInputRef.current?.click()}
									aria-controls="speaker-photo-input"
								>
									Use a different photo
								</button>
							</div>
							{photoError && (
								<p className={a.error} role="alert">
									{photoError}
								</p>
							)}

							{photo && photoSource !== 'monogram' && (
								<div className={a.rail}>
									<div className={a.railHead}>
										<span className={a.railLabel}>Zoom</span>
										<span className={a.railReadout}>{transform.zoom.toFixed(2)}×</span>
									</div>
									<div className={a.railTrackWrap}>
										<input
											className={a.range}
											type="range"
											min={MIN_ZOOM}
											max={MAX_ZOOM}
											step={0.01}
											value={transform.zoom}
											onChange={(e) => updateZoom(Number(e.target.value))}
											style={
												{
													'--fill': `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((transform.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, var(--rule-strong) ${((transform.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, var(--rule-strong) 100%)`,
												} as React.CSSProperties
											}
											aria-label="Zoom"
											aria-valuetext={`${transform.zoom.toFixed(2)}×`}
										/>
									</div>
								</div>
							)}
						</div>
					</section>
				)}

				<div className={s.exportRow}>
					<div className={a.actions}>
						<button type="button" className="btn-primary" onClick={handleDownload} disabled={exportDisabled}>
							Download PNG
						</button>
						<button type="button" className="btn-ghost" onClick={handleShare} disabled={exportDisabled}>
							{shareState === 'working' ? 'Sharing…' : 'Share'}
						</button>
					</div>
					<p
						className={a.message}
						role="status"
						aria-live="polite"
						data-tone={shareState === 'error' ? 'error' : 'info'}
					>
						{shareMessage}
					</p>
				</div>
			</div>

			<div className={a.preview}>
				<div className={a.cardWrap}>
					<canvas
						ref={canvasRef}
						width={CARD_SIZE}
						height={CARD_SIZE}
						className={a.canvas}
						role="img"
						aria-busy={photoLoading}
						aria-label={cardLabelFor(speaker, talk)}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerCancel={handlePointerUp}
						data-draggable={photo && photoSource !== 'monogram' ? 'true' : 'false'}
					/>
					{photoLoading && (
						<div className={s.photoLoading}>
							<LoadingState label="Developing your photo" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
