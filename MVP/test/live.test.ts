import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBreaches } from '../lib/breaches.ts';
import { liveCheck } from '../lib/live.ts';

const identity = {
  id: '7b2f15f1-2b9c-4310-b4fb-ffcdf92d4c24',
  email: 'verified@example.test',
  email_confirmed_at: '2026-11-12T13:45:00Z',
};
const config = {
  origin: 'https://app.example.test',
  url: 'https://project.example.test',
  publicKey: 'public-test-key',
  serviceKey: 'service-test-key',
  hibpKey: 'breach-test-key',
};
const breach = {
  Name: 'Example', Title: 'Example Service', BreachDate: '2026-10-01',
  DataClasses: ['Passwords'], IsVerified: true,
};

test('distinguishes a clean HIBP response from rate limits, outages and malformed responses', async () => {
  const statuses = [401, 403, 429, 503];
  for (const status of statuses) {
    assert.deepEqual(await checkBreaches(identity.email, config.hibpKey, async () => new Response(null, { status })), { state: 'failed' });
  }
  assert.deepEqual(await checkBreaches(identity.email, config.hibpKey, async () => new Response(null, { status: 404 })), { state: 'complete', breaches: [] });
  assert.deepEqual(await checkBreaches(identity.email, config.hibpKey, async () => Response.json([{}])), { state: 'failed' });
});

test('an expired or unverified session cannot reserve or execute a scan', async () => {
  for (const authResponse of [new Response(null, { status: 401 }), Response.json({ ...identity, email_confirmed_at: null })]) {
    let calls = 0;
    const live = liveCheck(config, async (url) => {
      assert.equal(String(url), config.url + '/auth/v1/user');
      calls++;
      return authResponse;
    });
    await live.scan('invalid-or-unverified');
    assert.equal(calls, 1);
  }
});

test('a verified scan takes its email from Auth, reserves the scan, and writes only sanitized metadata', async () => {
  const requests: string[] = [];
  const live = liveCheck(config, async (input, init) => {
    const url = new URL(String(input));
    requests.push(url.pathname);
    switch (url.pathname) {
      case '/auth/v1/user':
        assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer checked-token');
        return Response.json(identity);
      case '/rest/v1/rpc/koverr_claim_scan':
        assert.equal(JSON.parse(String(init?.body)).user_id_arg, identity.id);
        return Response.json(true);
      case '/api/v3/breachedaccount/verified%40example.test':
        assert.equal(url.hostname, 'haveibeenpwned.com');
        assert.equal(url.searchParams.get('includeUnverified'), 'false');
        assert.equal(new Headers(init?.headers).get('hibp-api-key'), config.hibpKey);
        return Response.json([{ ...breach, Description: '<img src=example>' }]);
      case '/rest/v1/koverr_checks': {
        assert.equal(url.searchParams.get('user_id'), 'eq.' + identity.id);
        assert.ok(url.searchParams.get('claim_id'));
        const body = JSON.parse(String(init?.body));
        assert.equal(body.state, 'complete');
        assert.equal(body.findings[0].steps[0].id, 'change-password');
        assert.equal(body.findings[0].Description, undefined);
        return new Response(null, { status: 204 });
      }
      default:
        assert.fail('Unexpected provider request');
    }
  });
  await live.scan('checked-token');
  assert.equal(requests.length, 4);
});

test('an OTP request uses a keyed rate-limit token and stops when the database refuses it', async () => {
  let calls = 0;
  const live = liveCheck(config, async (input, init) => {
    assert.equal(String(input), config.url + '/rest/v1/rpc/koverr_claim_otp');
    assert.match(JSON.parse(String(init?.body)).address_key_arg, /^[a-f0-9]{64}$/);
    calls++;
    return Response.json(false);
  });
  assert.equal(await live.sendCode(identity.email), 'limited');
  assert.equal(calls, 1);
});

test('verification rejects a provider result for an email other than the requested address', async () => {
  const live = liveCheck(config, async () => Response.json({
    user: identity, access_token: 'test-token', expires_in: 3600,
  }));
  assert.equal(await live.verifyCode('other@example.test', '123456'), null);
});
