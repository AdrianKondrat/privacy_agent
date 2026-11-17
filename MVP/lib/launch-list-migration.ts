import { DatabaseSync } from 'node:sqlite';
import { supabaseHeaders } from './supabase-headers.ts';
import { isVariant, regionKey, worryKey } from '../../src/lib/launch.ts';

export function loadLaunchList(path: string) {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const columns = new Set(db.prepare("PRAGMA table_info('waitlist')").all().map((column) => column.name));
    if (!['email', 'variant', 'consent_version', 'joined_at'].every((column) => columns.has(column))) {
      throw new Error('The source does not contain a supported waitlist table.');
    }
    const answers = ['region', 'worry'].map((column) => columns.has(column) ? column : 'NULL AS ' + column).join(', ');
    const seen = new Set<string>();
    return db.prepare('SELECT email, variant, consent_version, joined_at, ' + answers + ' FROM waitlist ORDER BY joined_at')
      .all().map((row, index) => {
        const email = typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';
        if (email.length > 254 || !/^[!-~]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(email) || email.split('@').length !== 2
          || !isVariant(row.variant) || typeof row.consent_version !== 'string' || !row.consent_version.trim()
          || row.consent_version.length > 100 || typeof row.joined_at !== 'string' || !Number.isFinite(Date.parse(row.joined_at))
          || (row.region !== null && !regionKey(row.region)) || (row.worry !== null && !worryKey(row.worry))
          || seen.has(email)) {
          throw new Error('Invalid or duplicate launch-list record at row ' + (index + 1) + '. No records were imported.');
        }
        seen.add(email);
        return {
          email, variant: row.variant, consent_version: row.consent_version,
          joined_at: new Date(row.joined_at).toISOString(), region: regionKey(row.region), worry: worryKey(row.worry),
        };
      });
  } finally {
    db.close();
  }
}

export type LaunchListRow = ReturnType<typeof loadLaunchList>[number];

export async function importLaunchList(rows: LaunchListRow[], url: URL, serviceKey: string, request = fetch) {
  const target = new URL('/rest/v1/koverr_launch_list?on_conflict=email&select=variant', url);
  let inserted = 0;
  for (let start = 0; start < rows.length; start += 200) {
    const batch = rows.slice(start, start + 200);
    try {
      const headers = supabaseHeaders(serviceKey, undefined, true);
      headers.set('content-type', 'application/json');
      headers.set('prefer', 'resolution=ignore-duplicates,return=representation');
      const response = await request(target, {
        method: 'POST', headers, body: JSON.stringify(batch), redirect: 'error', signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error();
      const result: unknown = await response.json();
      if (!Array.isArray(result) || result.length > batch.length) throw new Error();
      inserted += result.length;
    } catch {
      throw new Error('Import stopped at batch ' + (start / 200 + 1) + '. A retry with the same current backup is safe.');
    }
  }
  return { inserted, existing: rows.length - inserted };
}
