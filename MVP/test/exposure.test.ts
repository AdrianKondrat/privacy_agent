import assert from 'node:assert/strict';
import test from 'node:test';
import { exposureStore } from '../lib/exposure-store.ts';
import { liveCheck, liveConfig } from '../lib/live.ts';
import { activeSources, type Audit, updateExposure } from '../lib/exposure.ts';

const now = '2026-11-23T12:00:00Z';
const fields = (values: Record<string, string>) => {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) form.set(name, value);
  return form;
};

function update(previous: Audit | null, input: Record<string, string>) {
  const result = updateExposure(previous, fields(input), now);
  if ('error' in result) assert.fail(result.error);
  return result.data;
}

function rejected(previous: Audit | null, input: Record<string, string>) {
  assert.ok('error' in updateExposure(previous, fields(input), now));
}

const start = () => update(null, { intent: 'start', country: 'GB', agreement: 'yes', identifier: 'name-town' });
const possible = { intent: 'record-check', source: '192', status: 'possible',
  url: 'https://www.192.com/example/record?private=1#detail', 'data-type': 'address' };
const decide = { intent: 'decide', source: '192' };
const open = { intent: 'open-case', source: '192' };
const event = { intent: 'case-update', source: '192' };

test('starts with limited UK coverage and keeps failed, skipped and empty checks distinct', () => {
  rejected(null, { intent: 'start', country: 'US', agreement: 'yes' });
  rejected(null, { intent: 'start', country: 'GB' });
  let audit = start();
  assert.deepEqual(audit.identifiers, ['name-town']);
  assert.deepEqual(activeSources(audit), ['192', 'ukphonebook']);
  rejected(audit, { intent: 'expand' });
  rejected(audit, { ...possible, source: 'google' });
  audit = update(audit, { ...possible, status: 'failed' });
  audit = update(audit, { ...possible, source: 'ukphonebook', status: 'none' });
  assert.deepEqual(audit.checks, { 192: { status: 'failed', at: now }, ukphonebook: { status: 'none', at: now } });
  audit = update(audit, { intent: 'expand' });
  assert.deepEqual(activeSources(audit), ['192', 'ukphonebook', 'google']);
});

test('a rejected or unsure match cannot open a case and saved evidence omits query and fragment', () => {
  let audit = start();
  rejected(audit, { ...possible, url: 'https://www.192.com.example.test/person' });
  rejected(audit, { ...possible, url: 'https://name:password@www.192.com/person' });
  rejected(audit, { ...possible, url: 'javascript:alert(1)' });
  audit = update(audit, possible);
  assert.deepEqual(audit.checks['192'], {
    status: 'possible', at: now, url: 'https://www.192.com/example/record', dataType: 'address', observation: 'page',
  });
  rejected(audit, open);
  audit = update(audit, { ...decide, decision: 'rejected' });
  rejected(audit, open);
  audit = update(audit, { ...decide, decision: 'unsure' });
  rejected(audit, open);
  audit = update(audit, { ...decide, decision: 'mine' });
  audit = update(audit, open);
  assert.deepEqual(audit.cases['192'], { openedAt: now, events: [] });
  rejected(audit, { ...decide, decision: 'rejected' });
  audit = update(audit, { ...open, intent: 'discard-case' });
  assert.equal(audit.cases['192'], undefined);
  audit = update(audit, { ...decide, decision: 'rejected' });
  rejected(audit, open);
});

test('case history distinguishes actual submission, reply, follow-up and a failed recheck', () => {
  let audit = update(update(update(start(), possible), { ...decide, decision: 'mine' }), open);
  rejected(audit, { ...event, event: 'removal-reported' });
  rejected(audit, { ...event, event: 'submitted', 'submission-date': '2026-11-23' });
  rejected(audit, { ...event, event: 'submitted', sent: 'yes', 'submission-date': '2026-11-24' });
  audit = update(audit, { ...event, event: 'submitted', sent: 'yes', 'submission-date': '2026-11-23' });
  rejected(audit, { ...event, event: 'due', due: '2026-11-30' });
  rejected(audit, { ...event, event: 'action' });
  rejected(audit, { ...open, intent: 'discard-case' });
  audit = update(audit, { ...event, event: 'action', next: 'follow', due: '2026-11-30' });
  rejected(audit, { ...event, event: 'search-removed' });
  audit = update(audit, { ...event, event: 'removal-reported' });
  audit = update(audit, { ...event, event: 'recheck-failed', next: 'recheck' });
  audit = update(audit, { intent: 'assisted-session', minutes: '12', 'user-minutes': '15' });
  assert.deepEqual(audit.cases['192']?.events.map((entry) => entry.type), ['submitted', 'action', 'removal-reported', 'recheck-failed']);
  assert.deepEqual(audit.cases['192']?.events[1], { type: 'action', at: now, next: 'follow', due: '2026-11-30' });
  assert.deepEqual(audit.assistedSession, { minutes: 12, userMinutes: 15, at: now });
});

test('tracks an explicit opt-out separately from a confirmed broker match', () => {
  const experian = { intent: 'open-case', source: 'experian' };
  let audit = update(update(start(), { ...possible, status: 'not-checked' }), { ...possible, source: 'ukphonebook', status: 'not-checked' });
  rejected(audit, { ...experian, optional: 'yes' });
  audit = update(audit, { intent: 'expand' });
  rejected(audit, experian);
  audit = update(audit, { ...experian, optional: 'yes' });
  audit = update(audit, { ...event, source: 'experian', event: 'submitted', sent: 'yes', 'submission-date': '2026-11-23' });
  rejected(audit, { ...event, source: 'experian', event: 'removal-reported' });
  audit = update(audit, { ...event, source: 'experian', event: 'marketing-suppressed' });
  assert.equal(audit.checks['192']?.status, 'not-checked');
  assert.equal(audit.cases.experian?.events.at(-1)?.type, 'marketing-suppressed');
});

test('Supabase reads use the user token and stale edits cannot replace the current audit', async () => {
  const config = {
    origin: 'https://app.example.test', url: 'https://db.example.test', publicKey: 'public', serviceKey: 'sb_secret_test',
  };
  const store = exposureStore(config, async (input, init) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    if (init?.method === 'GET') {
      assert.equal(headers.get('authorization'), 'Bearer account-token');
      assert.equal(url.searchParams.get('user_id'), 'eq.account');
      return Response.json([]);
    }
    assert.equal(headers.get('apikey'), config.serviceKey);
    if (init?.method === 'POST') {
      assert.equal(url.searchParams.get('on_conflict'), 'user_id');
      assert.match(headers.get('prefer') ?? '', /ignore-duplicates/);
      assert.equal(JSON.parse(String(init.body)).user_id, 'account');
      return Response.json([{ revision: 1 }]);
    }
    assert.equal(url.searchParams.get('user_id'), 'eq.account');
    assert.equal(url.searchParams.get('revision'), 'eq.1');
    return Response.json([]);
  });
  assert.equal(await store.read('account-token', 'account'), null);
  assert.equal(await store.write('account', 0, start()), true);
  assert.equal(await store.write('account', 1, start()), false);
});

test('authentication can be configured and the legacy scan stops without a HIBP key', (t) => {
  const env = {
    KOVERR_APP_ORIGIN: 'https://app.example.test',
    KOVERR_SUPABASE_URL: 'https://db.example.test',
    KOVERR_SUPABASE_PUBLISHABLE_KEY: 'public',
    KOVERR_SUPABASE_SECRET_KEY: 'sb_secret_test',
    KOVERR_HIBP_API_KEY: '',
    KOVERR_PILOT_MODE: 'invite-only',
  };
  for (const [key, value] of Object.entries(env)) {
    const old = process.env[key];
    process.env[key] = value;
    t.after(() => old === undefined ? delete process.env[key] : process.env[key] = old);
  }
  const config = liveConfig();
  assert.ok(config?.inviteOnly);
  return liveCheck(config, async () => assert.fail('The legacy scan must stop before calling a provider')).scan('token');
});
