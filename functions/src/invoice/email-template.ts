/**
 * Branded HTML shell for the transactional emails this backend sends.
 *
 * Email HTML is not web HTML: Outlook renders through Word, Gmail strips
 * `<style>` on the mobile clients, and flexbox/grid/`rem`/CSS variables are
 * unusable. So everything here is deliberately old-fashioned — nested
 * `<table role="presentation">`, inline styles on every element, hex colours
 * (no `rgba()`, which Outlook drops), pixel widths, and a VML fallback for
 * the button so it still renders as a filled block in Outlook.
 *
 * The palette mirrors the site (`BaseLayout.scss`): dark ground, cream text,
 * red accent. `color-scheme: dark` is declared so clients that auto-invert
 * (Outlook.com, Apple Mail) leave the already-dark design alone.
 *
 * Brand fonts (Special Elite / Bebas Neue) are deliberately NOT webfont-linked
 * — most clients ignore `@font-face`, and a half-applied brand face looks
 * worse than a consistent system stack. The mono stack carries the same
 * technical-dossier feel the site gets from JetBrains Mono.
 */

/** Event/brand facts every email footer repeats. */
export const BRAND = {
	eventName: 'DevFest.cz 2026',
	tagline: "Prague's developer conference & festival",
	dateLine: 'Friday, 30 October 2026',
	venue: 'Uhelný Mlýn, Libčice nad Vltavou',
	siteUrl: 'https://devfest.cz',
	logoUrl: 'https://devfest.cz/logo.png',
	contactEmail: 'devfest@gug.cz',
	organizer: 'GUG.cz, z.s.',
} as const;

const COLOR = {
	page: '#050505',
	card: '#0D0D0D',
	panel: '#141414',
	border: '#242424',
	text: '#F2EFE9',
	cream: '#E8E0CC',
	muted: '#8C8C8C',
	accent: '#CC0000',
} as const;

const FONT_BODY =
	"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_MONO = "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace";

const CARD_WIDTH = 600;
const PAD_X = 40;

export interface EmailLayoutOptions {
	/** `<title>` + the hidden preview line shown in the inbox list. */
	title: string;
	preheader: string;
	/** Small mono label above the headline, e.g. "PAYMENT RECEIVED". */
	eyebrow: string;
	headline: string;
	/** Body of the card — already-escaped HTML from the block helpers below. */
	body: string;
}

/** Wrap pre-rendered blocks in the branded card + header + footer. */
export function renderEmail(opts: EmailLayoutOptions): string {
	const { title, preheader, eyebrow, headline, body } = opts;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${escapeHtml(title)}</title>
<!--[if mso]>
<style type="text/css">
	body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
	body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
	table { border-collapse: collapse !important; }
	img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
	a { color: ${COLOR.cream}; }
	/* Stop iOS/Gmail auto-linking addresses and dates into blue underlines. */
	a[x-apple-data-detectors], .unstyle-auto-detected-links a, .aBn {
		color: inherit !important;
		text-decoration: none !important;
		font-size: inherit !important;
		font-family: inherit !important;
		font-weight: inherit !important;
		line-height: inherit !important;
	}
	@media only screen and (max-width: 620px) {
		.card { width: 100% !important; }
		.pad { padding-left: 24px !important; padding-right: 24px !important; }
		.h1 { font-size: 26px !important; line-height: 32px !important; }
		.code { font-size: 20px !important; line-height: 28px !important; letter-spacing: 1px !important; }
		.btn { width: 100% !important; }
		.btn a { display: block !important; text-align: center !important; }
	}
</style>
</head>
<body style="margin:0; padding:0; background-color:${COLOR.page}; color:${COLOR.text};">
	<div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
		${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;
	</div>
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLOR.page};">
		<tr>
			<td align="center" style="padding:32px 12px 48px 12px;">
				<table role="presentation" class="card" cellpadding="0" cellspacing="0" border="0" width="${CARD_WIDTH}" style="width:${CARD_WIDTH}px; max-width:${CARD_WIDTH}px; background-color:${COLOR.card}; border:1px solid ${COLOR.border};">
					<!-- accent rule -->
					<tr>
						<td style="height:3px; line-height:3px; font-size:0; background-color:${COLOR.accent};">&nbsp;</td>
					</tr>
					<!-- header -->
					<tr>
						<td class="pad" align="left" style="padding:${28}px ${PAD_X}px 0 ${PAD_X}px;">
							<img src="${BRAND.logoUrl}" width="200" height="40" alt="${escapeAttr(BRAND.eventName)}" style="display:block; width:200px; max-width:200px; height:auto; border:0;" />
						</td>
					</tr>
					<!-- eyebrow + headline -->
					<tr>
						<td class="pad" align="left" style="padding:32px ${PAD_X}px 0 ${PAD_X}px;">
							<p style="margin:0 0 14px 0; font-family:${FONT_MONO}; font-size:11px; line-height:16px; letter-spacing:2.5px; text-transform:uppercase; color:${COLOR.accent};">${escapeHtml(eyebrow)}</p>
							<h1 class="h1" style="margin:0; font-family:${FONT_BODY}; font-size:30px; line-height:36px; font-weight:700; letter-spacing:-0.4px; color:${COLOR.text};">${escapeHtml(headline)}</h1>
						</td>
					</tr>
					<!-- body -->
					<tr>
						<td class="pad" align="left" style="padding:0 ${PAD_X}px 8px ${PAD_X}px;">
${body}
						</td>
					</tr>
					<!-- footer -->
					<tr>
						<td class="pad" style="padding:8px ${PAD_X}px 32px ${PAD_X}px;">
							<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
								<tr>
									<td style="height:1px; line-height:1px; font-size:0; background-color:${COLOR.border};">&nbsp;</td>
								</tr>
							</table>
							<p style="margin:24px 0 0 0; font-family:${FONT_MONO}; font-size:11px; line-height:18px; letter-spacing:1.6px; text-transform:uppercase; color:${COLOR.cream};">${escapeHtml(BRAND.eventName)}</p>
							<p style="margin:6px 0 0 0; font-family:${FONT_BODY}; font-size:13px; line-height:20px; color:${COLOR.muted};">
								${escapeHtml(BRAND.dateLine)}<br />
								${escapeHtml(BRAND.venue)}
							</p>
							<p style="margin:16px 0 0 0; font-family:${FONT_BODY}; font-size:13px; line-height:20px; color:${COLOR.muted};">
								<a href="${escapeAttr(BRAND.siteUrl)}" style="color:${COLOR.cream}; text-decoration:underline;">devfest.cz</a>
								&nbsp;·&nbsp;
								<a href="mailto:${escapeAttr(BRAND.contactEmail)}" style="color:${COLOR.cream}; text-decoration:underline;">${escapeHtml(BRAND.contactEmail)}</a>
							</p>
							<p style="margin:18px 0 0 0; font-family:${FONT_BODY}; font-size:12px; line-height:18px; color:${COLOR.muted};">
								This is an automated message about your ${escapeHtml(BRAND.eventName)} order — no newsletter, no marketing.
								Organised by ${escapeHtml(BRAND.organizer)}
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}

// ── Body blocks ───────────────────────────────────────────────────────────
// Each returns a table row/paragraph sized for the card's content column, so
// a message is composed as `[paragraph(...), codePanel(...), button(...)]`.

/** Body copy. Pass already-escaped HTML for inline emphasis. */
export function paragraph(html: string, opts: { top?: number } = {}): string {
	const top = opts.top ?? 20;
	return `<p style="margin:${top}px 0 0 0; font-family:${FONT_BODY}; font-size:16px; line-height:26px; color:${COLOR.text};">${html}</p>`;
}

/** Secondary copy — footnotes, fallbacks, "what happens next" detail. */
export function small(html: string, opts: { top?: number } = {}): string {
	const top = opts.top ?? 16;
	return `<p style="margin:${top}px 0 0 0; font-family:${FONT_BODY}; font-size:13px; line-height:20px; color:${COLOR.muted};">${html}</p>`;
}

/** The hero element of the code email: the code itself, in a bordered panel. */
export function codePanel(opts: { label: string; value: string; note?: string }): string {
	const note = opts.note
		? `<p style="margin:12px 0 0 0; font-family:${FONT_BODY}; font-size:13px; line-height:20px; color:${COLOR.muted};">${escapeHtml(opts.note)}</p>`
		: '';
	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px; background-color:${COLOR.panel}; border:1px solid ${COLOR.border};">
	<tr>
		<td align="center" style="padding:24px 20px;">
			<p style="margin:0 0 12px 0; font-family:${FONT_MONO}; font-size:11px; line-height:16px; letter-spacing:2px; text-transform:uppercase; color:${COLOR.muted};">${escapeHtml(opts.label)}</p>
			<p class="code" style="margin:0; font-family:${FONT_MONO}; font-size:26px; line-height:34px; letter-spacing:3px; font-weight:700; color:${COLOR.cream}; word-break:normal; overflow-wrap:break-word;">${escapeHtml(opts.value)}</p>
			${note}
		</td>
	</tr>
</table>`;
}

/** Label/value rows — invoice number, amount, due date. */
export function detailList(rows: Array<{ label: string; value: string }>): string {
	const body = rows
		.map(
			(r) => `	<tr>
		<td style="padding:6px 0; font-family:${FONT_MONO}; font-size:11px; line-height:18px; letter-spacing:1.6px; text-transform:uppercase; color:${COLOR.muted}; white-space:nowrap;">${escapeHtml(r.label)}</td>
		<td align="right" style="padding:6px 0; font-family:${FONT_BODY}; font-size:15px; line-height:22px; color:${COLOR.text};">${escapeHtml(r.value)}</td>
	</tr>`,
		)
		.join('\n');
	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px; border-top:1px solid ${COLOR.border}; border-bottom:1px solid ${COLOR.border};">
	<tr><td colspan="2" style="height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>
${body}
	<tr><td colspan="2" style="height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>
</table>`;
}

/**
 * Bulletproof CTA: a padded `<a>` for everything modern, wrapped in a VML
 * rounded-rect so Outlook (Word engine, which ignores `padding` on inline
 * elements) still paints a filled button rather than a bare link.
 */
export function button(opts: { href: string; label: string }): string {
	const href = escapeAttr(opts.href);
	const label = escapeHtml(opts.label);
	return `<table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
	<tr>
		<td align="left">
			<!--[if mso]>
			<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px; v-text-anchor:middle; width:280px;" arcsize="4%" strokecolor="${COLOR.accent}" fillcolor="${COLOR.accent}">
				<w:anchorlock/>
				<center style="color:#FFFFFF; font-family:Arial, sans-serif; font-size:14px; font-weight:bold; letter-spacing:1px;">${label}</center>
			</v:roundrect>
			<![endif]-->
			<!--[if !mso]><!-- -->
			<a href="${href}" style="display:inline-block; background-color:${COLOR.accent}; color:#FFFFFF; font-family:${FONT_BODY}; font-size:14px; font-weight:700; letter-spacing:1px; text-transform:uppercase; line-height:20px; padding:14px 30px; border:1px solid ${COLOR.accent}; border-radius:2px; text-decoration:none; mso-hide:all;">${label}</a>
			<!--<![endif]-->
		</td>
	</tr>
</table>`;
}

/** Numbered "what happens next" steps. */
export function steps(items: string[]): string {
	const rows = items
		.map(
			(text, i) => `	<tr>
		<td valign="top" width="28" style="padding:8px 12px 0 0; font-family:${FONT_MONO}; font-size:13px; line-height:20px; font-weight:700; color:${COLOR.accent};">${String(i + 1).padStart(2, '0')}</td>
		<td valign="top" style="padding:8px 0 0 0; font-family:${FONT_BODY}; font-size:14px; line-height:22px; color:${COLOR.text};">${text}</td>
	</tr>`,
		)
		.join('\n');
	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;">
${rows}
</table>`;
}

/** Inline link inside body copy. */
export function link(href: string, label: string): string {
	return `<a href="${escapeAttr(href)}" style="color:${COLOR.cream}; text-decoration:underline; word-break:break-all;">${escapeHtml(label)}</a>`;
}

/** Bold emphasis inside body copy. */
export function strong(text: string): string {
	return `<strong style="color:${COLOR.text};">${escapeHtml(text)}</strong>`;
}

// ── Escaping ──────────────────────────────────────────────────────────────

/** Escape text destined for element content. */
export function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Escape text destined for a double-quoted attribute (href, alt).
 * Same rules as element content here, but named separately so a call site
 * reads as intent — `href` values are attacker-adjacent (they come back
 * from ti.to) and must never be interpolated raw.
 */
export function escapeAttr(s: string): string {
	return escapeHtml(s);
}
