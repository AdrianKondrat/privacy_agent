import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { importLaunchList, loadLaunchList } from '../lib/launch-list-migration.ts';

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
