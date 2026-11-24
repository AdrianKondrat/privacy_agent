import assert from 'node:assert/strict';
import test from 'node:test';
import { checkLivePilot } from '../scripts/check-live-pilot.ts';

const origin = new URL('https://pilot.example.test');
const form = '<p>Assisted audit</p><form data-koverr-pilot="invite-only"></form>';

const fixture = (path: string) => {
  switch (path) {
    case '/app/health/': return new Response('ok\n');
    case '/app/audit/': return new Response(form, { headers: { 'cache-control': 'private, no-store' } });
    case '/': return new Response(null, { status: 302, headers: { location: '/app/' } });
    case '/app/': return new Response(null, { status: 302, headers: { location: '/app/audit/' } });
    case '/app/?sample=1': return new Response('These findings are fictional.');
    case '/api/launch-list/': return new Response(null, { status: 404 });
    default: return assert.fail('Unexpected probe: ' + path);
  }
};

test('checks the private Worker routes without submitting data', async () => {
  const paths: string[] = [];
  await checkLivePilot(origin, async (input, options) => {
    const url = new URL(String(input));
    const path = url.pathname + url.search;
    assert.equal(url.origin, origin.origin);
    assert.equal(options?.method, undefined);
    assert.equal(options?.redirect, ['/', '/app/', '/api/launch-list/'].includes(path) ? 'manual' : 'error');
    paths.push(path);
    return fixture(path);
  });
  assert.deepEqual(paths, ['/app/health/', '/app/audit/', '/', '/app/', '/app/?sample=1', '/api/launch-list/']);
});

test('rejects a failing health endpoint and a sample or open signup form', async () => {
  await assert.rejects(checkLivePilot(origin, async () => new Response('ok\n', { status: 503 })), /health endpoint/);
  await assert.rejects(checkLivePilot(origin, async (input) =>
    new URL(String(input)).pathname === '/app/audit/' ? new Response('<form></form>') : fixture(new URL(String(input)).pathname)), /invite-only form/);
});

test('rejects a cacheable audit and a Worker with the landing signup route', async () => {
  const substitute = (path: string, response: Response): typeof fetch => async (input) => {
    const url = new URL(String(input));
    const route = url.pathname + url.search;
    return route === path ? response : fixture(route);
  };
  await assert.rejects(checkLivePilot(origin, substitute('/app/audit/', new Response(form))), /invite-only form/);
  await assert.rejects(checkLivePilot(origin, substitute('/api/launch-list/', new Response())), /landing signup route/);
});
