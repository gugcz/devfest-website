/** mrkdwn escaping: the three entities Slack documents, nothing else. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { escapeMrkdwn } from './slack.js';

describe('escapeMrkdwn', () => {
	it('neutralises mass pings and disguised links', () => {
		assert.equal(escapeMrkdwn('<!channel> Acme'), '&lt;!channel&gt; Acme');
		assert.equal(
			escapeMrkdwn('<https://evil.example|Acme s.r.o.>'),
			'&lt;https://evil.example|Acme s.r.o.&gt;',
		);
	});

	it('escapes ampersands first so entities are not double-escaped', () => {
		assert.equal(escapeMrkdwn('R&D <ops>'), 'R&amp;D &lt;ops&gt;');
		assert.equal(escapeMrkdwn('&lt;'), '&amp;lt;');
	});

	it('leaves ordinary text and our own formatting alone', () => {
		assert.equal(escapeMrkdwn('Acme Example s.r.o. — *paid*'), 'Acme Example s.r.o. — *paid*');
		assert.equal(escapeMrkdwn(''), '');
	});
});
