import { parse as parseCsv } from 'csv-parse/browser/esm/sync';
import { inventoryDomain } from './domains.ts';
export { inventoryDomain } from './domains.ts';
import directory from '../data/closure-directory.json' with { type: 'json' };

export const inventoryLimit = 2_000;
export const inventoryFileLimit = 2 * 1024 * 1024;
const urlHeaders = new Set(['url', 'website', 'web site', 'login uri', 'uri', 'site', 'login url']);
export const inventoryChoices = {
  review: 'To review',
  keep: 'Keep',
  close: 'Close',
  unsure: 'Not sure',
} as const;
export type InventoryChoice = keyof typeof inventoryChoices;

export function parseInventoryCsv(contents: string) {
  const [headers, ...rows]: string[][] = parseCsv(contents, {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    max_record_size: 256 * 1024,
  });
  const urlColumn = headers?.findIndex((header) => urlHeaders.has(header.trim().toLowerCase().replace(/[_-]/g, ' '))) ?? -1;
  if (urlColumn < 0) throw new Error('The CSV needs a website or URL column.');

  const domains = new Set<string>();
  let skipped = 0;
  for (const row of rows) {
    const domain = inventoryDomain(row[urlColumn] ?? '');
    if (domain) domains.add(domain);
    else skipped++;
    if (domains.size > inventoryLimit) throw new Error('Use a CSV with up to 2,000 unique sites.');
  }
  return { domains: [...domains], skipped };
}

export const knownDomains = Object.keys(directory);

export function companyFor(domain: string) {
  if (Object.hasOwn(directory, domain)) return directory[domain as keyof typeof directory];
}
