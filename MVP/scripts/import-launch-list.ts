import { parseArgs } from 'node:util';
import { importLaunchList, loadLaunchList, verifyLaunchList } from '../lib/launch-list-migration.ts';

async function main() {
  const { values } = parseArgs({
    options: { source: { type: 'string' }, apply: { type: 'boolean' }, verify: { type: 'boolean' } },
  });
  if (!values.source || (values.apply && values.verify)) {
    throw new Error('Usage: node MVP/scripts/import-launch-list.ts --source /path/to/waitlist.sqlite [--apply | --verify]');
  }
  let rows;
  try {
    rows = loadLaunchList(values.source);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('Invalid or duplicate') || message.startsWith('The source does not contain')) throw error;
    throw new Error('Could not read the SQLite backup. Check its path and permissions.');
  }
  if (!values.apply && !values.verify) {
    console.log(JSON.stringify({ mode: 'dry-run', validRows: rows.length }));
    return;
  }
  const urlValue = process.env.KOVERR_SUPABASE_URL;
  const key = process.env.KOVERR_SUPABASE_SECRET_KEY || process.env.KOVERR_SUPABASE_SERVICE_ROLE_KEY;
  if (!urlValue || !key) throw new Error('Set the destination Supabase URL and server key.');
  const url = URL.parse(urlValue);
  if (!url || url.protocol !== 'https:' || url.href !== url.origin + '/') throw new Error('Set a valid HTTPS Supabase origin.');
  if (values.verify) {
    const counts = await verifyLaunchList(rows, url, key);
    console.log(JSON.stringify({ mode: 'verify', ...counts }));
    if (counts.different || counts.extra || counts.missing || counts.invited) process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ mode: 'apply', ...await importLaunchList(rows, url, key) }));
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error && 'code' in error && error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
    ? 'Unknown option. Use --source with optional --apply or --verify.'
    : error instanceof Error && !('code' in error) ? error.message : 'Could not complete the import.');
  process.exitCode = 1;
}
