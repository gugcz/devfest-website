import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decodeReactError, readableError } from './react-errors.ts';

// What React 19's production build throws (formatProdErrorMessage).
function minified(code: number, ...args: string[]): string {
	const query = args.map((arg, i) => `${i ? '&' : '?'}args[]=${encodeURIComponent(arg)}`).join('');
	return `Minified React error #${code}; visit https://react.dev/errors/${code}${query} for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`;
}

describe('decodeReactError', () => {
	it('gives a known code its message with the arguments filled in', () => {
		assert.equal(
			decodeReactError(minified(418, 'HTML', '')),
			"React error #418: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client.",
		);
	});

	it('gives a known code without arguments its message', () => {
		assert.equal(
			decodeReactError(minified(423)),
			'React error #423: There was an error while hydrating but React was able to recover by instead client rendering the entire root.',
		);
	});

	it('keeps an unknown code, its non-empty arguments and the link', () => {
		assert.equal(
			decodeReactError(minified(130, 'undefined', '')),
			'React error #130 (undefined): https://react.dev/errors/130?args[]=undefined&args[]=',
		);
		assert.equal(decodeReactError(minified(310)), 'React error #310: https://react.dev/errors/310');
	});

	it('leaves any other message alone', () => {
		assert.equal(decodeReactError('Cannot read properties of undefined'), null);
		assert.equal(decodeReactError(`Wrapped: ${minified(418, 'HTML')}`), null);
	});
});

describe('readableError', () => {
	it('rewrites the message and the head of a V8 stack, keeping the frames', () => {
		const error = new Error(minified(418, 'text', ''));
		error.stack = `Error: ${error.message}\n    at hydrate (NewsletterForm.js:1:2)`;
		const readable = readableError(error);
		assert.ok(readable instanceof Error);
		assert.match(readable.message, /^React error #418: Hydration failed because the server rendered text /);
		assert.equal(readable.stack, `Error: ${readable.message}\n    at hydrate (NewsletterForm.js:1:2)`);
	});

	it('keeps a stack that does not repeat the message', () => {
		const error = new Error(minified(418, 'HTML'));
		error.stack = 'hydrate@NewsletterForm.js:1:2';
		const readable = readableError(error) as Error;
		assert.equal(readable.stack, 'hydrate@NewsletterForm.js:1:2');
	});

	it('decodes the cause React wraps a hydration error in', () => {
		const error = new Error(minified(423), { cause: new Error(minified(418, 'HTML')) });
		const readable = readableError(error) as Error;
		assert.match(readable.message, /^React error #423: .* Cause: React error #418: Hydration failed/);
	});

	it('returns anything else as it is', () => {
		const error = new TypeError('x is not a function');
		assert.equal(readableError(error), error);
		assert.equal(readableError('a string'), 'a string');
		assert.equal(readableError(undefined), undefined);
	});
});
