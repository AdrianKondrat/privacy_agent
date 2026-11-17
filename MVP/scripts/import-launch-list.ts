import { parseArgs } from 'node:util';
import { importLaunchList, loadLaunchList } from '../lib/launch-list-migration.ts';

async function main() {
  const { values } = parseArgs({ options: { source: { type: 'string' }, apply: { type: 'boolean' } } });
  if (!values.source) throw new Error('Usage: node MVP/scripts/import-launch-list.ts --source /path/to/waitlist.sqlite [--apply]');
  let rows;
  try {
    rows = loadLaunchList(values.source);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('Invalid or duplicate') || message.startsWith('The source does not contain')) throw error;
    throw new Error('Could not read the SQLite backup. Check its path and permissions.');
  }
  if (!values.apply) {
    console.log(JSON.stringify({ mode: 'dry-run', validRows: rows.length }));
    return;
  }
  const { KOVERR_SUPABASE_URL, KOVERR_SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!KOVERR_SUPABASE_URL || !KOVERR_SUPABASE_SERVICE_ROLE_KEY) throw new Error('Set the destination Supabase URL and server key.');
  const url = URL.parse(KOVERR_SUPABASE_URL);
  if (!url || url.protocol !== 'https:' || url.href !== url.origin + '/') throw new Error('Set a valid HTTPS Supabase origin.');
  console.log(JSON.stringify({ mode: 'apply', ...await importLaunchList(rows, url, KOVERR_SUPABASE_SERVICE_ROLE_KEY) }));
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error && 'code' in error && error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
    ? 'Unknown option. Use --source and optional --apply.'
    : error instanceof Error && !('code' in error) ? error.message : 'Could not complete the import.');
  process.exitCode = 1;
}
