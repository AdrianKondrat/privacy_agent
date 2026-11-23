import assert from 'node:assert/strict';
import test from 'node:test';
import { checkLivePilot } from '../scripts/check-live-pilot.ts';

const origin = new URL('https://pilot.example.test');

test('checks health and the invite-only form without submitting data', async () => {
  const paths: string[] = [];
  const request: typeof fetch = async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.origin, origin.origin);
    assert.equal(options?.method, undefined);
    assert.equal(options?.redirect, 'error');
    paths.push(url.pathname);
    return new Response(url.pathname === '/app/health/' ? 'ok\n' : '<p>Assisted audit</p><form data-koverr-pilot="invite-only"></form>');
  };
  await checkLivePilot(origin, request);
  assert.deepEqual(paths, ['/app/health/', '/app/audit/']);
});

test('rejects a failing health endpoint and a sample or open signup form', async () => {
  await assert.rejects(checkLivePilot(origin, async () => new Response('ok\n', { status: 503 })), /health endpoint/);
  await assert.rejects(checkLivePilot(origin, async (input) =>
    new Response(String(input).endsWith('/health/') ? 'ok\n' : '<form></form>')), /invite-only form/);
});
