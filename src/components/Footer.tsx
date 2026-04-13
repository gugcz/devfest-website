import s from './Footer.module.scss';

function XIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function FacebookIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
		</svg>
	);
}

function BlueskyIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.59 3.513 6.182 3.2-4.574.552-8.657 2.444-5.282 7.777C4.537 25.405 8.093 20.463 12 16.08c3.907 4.383 7.376 9.199 10.476 5.144 3.375-5.333-.708-7.225-5.282-7.777 2.592.313 5.397-.573 6.182-3.2.246-.828.624-5.788.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
		</svg>
	);
}

function LinkedInIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	);
}

function YouTubeIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
		</svg>
	);
}

const SOCIALS = [
	{ href: 'https://x.com/devfest_cz', label: 'X (Twitter)', icon: XIcon },
	{ href: 'https://www.facebook.com/DevFestCZ', label: 'Facebook', icon: FacebookIcon },
	{ href: 'https://bsky.app/profile/devfest.cz', label: 'Bluesky', icon: BlueskyIcon },
	{ href: 'https://www.linkedin.com/company/gugcz/', label: 'LinkedIn', icon: LinkedInIcon },
	{ href: 'https://www.youtube.com/@gug_cz', label: 'YouTube', icon: YouTubeIcon },
] as const;

export default function Footer() {
	return (
		<footer className={s.footer}>
			<div>Organized with ♥️ by GUG.cz, z.s. © 2026, All Rights Reserved</div>
			<nav className={s.socials} aria-label="Social media">
				{SOCIALS.map(({ href, label, icon: Icon }) => (
					<a
						key={label}
						className={s.socialLink}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={label}
					>
						<Icon />
					</a>
				))}
			</nav>
			<div className={s.contact}>
				<span className={s.contactLabel}>Contact</span>
				<a className={s.email} href="mailto:devfest@gug.cz">
					devfest@gug.cz
				</a>
			</div>
		</footer>
	);
}
