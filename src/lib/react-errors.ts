/**
 * React's production build throws an error code and a link, not the message:
 * "Minified React error #418; visit https://react.dev/errors/418?args[]=HTML…".
 * Crashlytics gets the message back for the errors React reports from
 * hydration; any other code keeps its number, its arguments and the link.
 */

/** Texts from `react-dom-client.development.js` (React 19), `%s` for an
 * argument. Only the errors React recovers from and reports to the page:
 * the ones a visitor's browser extension or translator can cause. */
const MESSAGES: Readonly<Record<number, string>> = {
	418: "Hydration failed because the server rendered %s didn't match the client. As a result this tree will be regenerated on the client.",
	419: 'The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering.',
	422: 'There was an error while hydrating but React was able to recover by instead client rendering from the nearest Suspense boundary.',
	423: 'There was an error while hydrating but React was able to recover by instead client rendering the entire root.',
	520: 'There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the entire root.',
};

const MINIFIED = /^Minified React error #(\d+); visit (https:\/\/react\.dev\/errors\/\d+\S*) for the full message/;

/** The readable message for a minified React error message, or `null` when
 * `message` is not one. */
export function decodeReactError(message: string): string | null {
	const match = MINIFIED.exec(message);
	if (!match) return null;
	const code = Number(match[1]);
	const link = match[2];
	const args = new URL(link).searchParams.getAll('args[]');
	const text = MESSAGES[code];
	if (text) {
		let next = 0;
		return `React error #${code}: ${text.replace(/%s/g, () => args[next++] ?? '')}`;
	}
	const given = args.filter((arg) => arg !== '');
	return `React error #${code}${given.length ? ` (${given.join(', ')})` : ''}: ${link}`;
}

/** `error` with a minified React message, its own or its cause's, made
 * readable; the stack is kept. Anything else comes back unchanged. */
export function readableError(error: unknown): unknown {
	if (!(error instanceof Error)) return error;
	const own = decodeReactError(error.message);
	const cause = error.cause instanceof Error ? decodeReactError(error.cause.message) : null;
	if (!own && !cause) return error;

	const message = [own ?? error.message, cause && `Cause: ${cause}`].filter(Boolean).join(' ');
	const readable = new Error(message);
	readable.name = error.name;
	// V8 starts the stack with "<name>: <message>"; Firefox and Safari don't.
	const head = `${error.name}: ${error.message}`;
	readable.stack = error.stack?.startsWith(head)
		? `${error.name}: ${message}${error.stack.slice(head.length)}`
		: error.stack;
	return readable;
}
