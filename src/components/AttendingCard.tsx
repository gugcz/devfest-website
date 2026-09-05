import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	CARD_SIZE,
	DEFAULT_TRANSFORM,
	ROLES,
	clampPan,
	coverScale,
	drawAttendingCard,
	resolveFontFamily,
	type AttendingRole,
	type PhotoTransform,
} from '../lib/attending-card';
import s from './AttendingCard.module.scss';

// Matches the square well in `drawAttendingCard` — kept in sync manually
// since the draw function is the only other place that needs it.
const WELL_SIZE = 700;
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
	const [fontsReady, setFontsReady] = useState(false);

	const dragRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(
		null,
	);

	// Astro's `fonts` integration self-hosts Bebas Neue / JetBrains Mono behind
	// CSS custom properties; `document.fonts.ready` is the load signal for
	// canvas text, which (unlike CSS) doesn't wait for webfonts on its own.
	useEffect(() => {
		document.fonts.ready.then(() => setFontsReady(true));
	}, []);

	const fonts = useMemo(
		() =>
			typeof window === 'undefined'
				? { bebas: 'sans-serif', mono: 'monospace' }
				: {
						bebas: resolveFontFamily('--font-bebas-neue'),
						mono: resolveFontFamily('--font-jetbrains-mono'),
					},
		[fontsReady],
	);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		drawAttendingCard(ctx, { name, role, photo, transform }, fonts);
	}, [name, role, photo, transform, fonts]);

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
			setPhoto(bitmap);
			setTransform(DEFAULT_TRANSFORM);
		} catch {
			setPhotoError("Couldn't read that image. Try a different file.");
		}
	}

	function removePhoto() {
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
		URL.revokeObjectURL(url);
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
					/>
				</label>

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
					/>
					<span className={s.hint}>
						Processed entirely in your browser — never uploaded anywhere. No photo? We'll use your initials instead.
					</span>
				</label>

				{photoError && (
					<p className={s.error} role="alert">
						{photoError}
					</p>
				)}

				{photo && (
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
						<span className={s.hint}>Drag the photo above to reposition it.</span>
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
					aria-label="Your DevFest.cz 2026 share card preview"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					data-draggable={photo ? 'true' : 'false'}
				/>

				<div className={s.actions}>
					<button type="button" className="btn-primary" onClick={handleDownload}>
						Download PNG
					</button>
					<button type="button" className="btn-ghost" onClick={handleShare} disabled={shareState === 'working'}>
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
