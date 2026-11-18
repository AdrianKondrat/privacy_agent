import { parseArgs } from 'node:util';
import { exportLaunchList } from '../lib/launch-list-migration.ts';

try {
  const { values } = parseArgs({ options: { source: { type: 'string' }, output: { type: 'string' } } });
  if (!values.source || !values.output) {
    throw new Error('Usage: node MVP/scripts/export-launch-list.ts --source /path/to/waitlist.sqlite --output /private/roster.sqlite');
  }
  console.log(JSON.stringify({ exported: exportLaunchList(values.source, values.output) }));
} catch (error) {
  const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined;
  console.error(code === 'EEXIST'
    ? 'The output file already exists. Use a new file name.'
    : error instanceof Error && /^(Usage|Invalid or duplicate|The source does not contain)/.test(error.message)
      ? error.message
      : 'Could not export the roster. Check the source database, output directory, and file permissions.');
  process.exitCode = 1;
}
