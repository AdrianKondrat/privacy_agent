import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { importLaunchList, loadLaunchList, verifyLaunchList } from '../lib/launch-list-migration.ts';

test('imports old and current SQLite snapshots without follow-up tokens or invitation state', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'koverr-list-test-'));
  const path = join(folder, 'list.sqlite');
  const db = new DatabaseSync(path);
  try {
    db.exec(`create table waitlist (email text, variant text, consent_version text, joined_at text);
      insert into waitlist values ('Owner@Example.test', 'breach', 'launch-invite-v1', '2026-11-12T10:00:00Z');`);
    assert.deepEqual(loadLaunchList(path), [{
      email: 'owner@example.test', variant: 'breach', consent_version: 'launch-invite-v1',
      joined_at: '2026-11-12T10:00:00.000Z', region: null, worry: null,
    }]);
    db.exec(`alter table waitlist add region text;
      alter table waitlist add worry text;
      alter table waitlist add followup_token text;
      update waitlist set region = 'uk', worry = 'scams', followup_token = 'test-token';`);
    const rows = loadLaunchList(path);
    assert.deepEqual(rows.map(({ region, worry }) => ({ region, worry })), [{ region: 'uk', worry: 'scams' }]);
    const counts = await importLaunchList(rows, new URL('https://project.example.test'), 'fixture-key', async (url, options) => {
      assert.equal(String(url), 'https://project.example.test/rest/v1/koverr_launch_list?on_conflict=email&select=variant');
      assert.equal(new Headers(options?.headers).get('prefer'), 'resolution=ignore-duplicates,return=representation');
      assert.deepEqual(JSON.parse(String(options?.body)), rows);
      assert.doesNotMatch(String(options?.body), /test-token|invited_at/);
      return Response.json([]);
    });
    assert.deepEqual(counts, { inserted: 0, existing: 1 });
    db.exec("update waitlist set worry = 'unknown'");
    assert.throws(() => loadLaunchList(path), /Invalid or duplicate launch-list record at row 1/);
  } finally {
    db.close();
    rmSync(folder, { recursive: true });
  }
});

test('verifies roster pages and reports differences without sending addresses or writing records', async () => {
  const first = {
    email: 'first@example.test', variant: 'breach' as const, consent_version: 'v1',
    joined_at: '2026-11-12T10:00:00.000Z', region: null, worry: null,
  };
  const second = { ...first, email: 'second@example.test' };
  const rows = [first, second, { ...first, email: 'missing@example.test' }];
  const pages = [
    [{ ...first, joined_at: '2026-11-12T11:00:00+01:00', invited_at: null }],
    [{ ...second, consent_version: 'v0', invited_at: '2026-11-18T11:00:00Z' }],
    [{ ...first, email: 'stale@example.test', invited_at: null }],
    [],
  ];
  let offset = 0;
  const url = new URL('https://project.example.test');
  const counts = await verifyLaunchList(rows, url, 'fixture-key', async (input, options) => {
    const target = new URL(String(input));
    assert.equal(target.pathname, '/rest/v1/koverr_launch_list');
    assert.equal(target.searchParams.get('offset'), String(offset));
    assert.equal(target.searchParams.get('order'), 'email.asc');
    assert.doesNotMatch(target.search, /example\.test/);
    assert.equal(options?.method, undefined);
    assert.equal(options?.body, undefined);
    return Response.json(pages[offset++]);
  });
  assert.deepEqual(counts, { matched: 1, different: 1, extra: 1, missing: 1, invited: 1 });
  await assert.rejects(verifyLaunchList(rows, url, 'fixture-key',
    async () => Response.json(pages[0])), /Could not verify the destination roster/);
});
