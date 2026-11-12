import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPassword } from '../lib/password-range.ts';

const input = 'password';
const suffix = '1E4C9B93F3F0682250B6CF8331B7EE68FD8';
const placeholder = '0'.repeat(35);

test('password lookup only sends the five-character prefix and compares padded results locally', async () => {
  const result = await checkPassword(input, async (url, options) => {
    assert.equal(url, 'https://api.pwnedpasswords.com/range/5BAA6');
    assert.equal(new Headers(options?.headers).get('add-padding'), 'true');
    assert.equal(options?.credentials, 'omit');
    assert.equal(options?.referrerPolicy, 'no-referrer');
    assert.equal(options?.body, undefined);
    return new Response(`${placeholder}:0\r\n${suffix}:3\r\n`);
  });
  assert.equal(result, 'found');
});

test('padding and unrelated hashes do not produce a match', async () => {
  assert.equal(await checkPassword(input, async () => new Response(`${suffix}:0\r\n${placeholder}:1`)), 'absent');
});

test('an empty, malformed or failed range response stays unavailable', async () => {
  for (const body of ['', 'invalid', `${suffix}:3\nmalformed`]) {
    assert.equal(await checkPassword(input, async () => new Response(body)), 'unavailable');
  }
  assert.equal(await checkPassword(input, async () => new Response(null, { status: 429 })), 'unavailable');
});
