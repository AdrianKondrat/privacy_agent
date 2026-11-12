import { parse as parseCsv } from 'csv-parse/browser/esm/sync';
import { parse as parseDomain } from 'tldts';
import directory from '../data/closure-directory.json' with { type: 'json' };

export const inventoryLimit = 2_000;
export const inventoryFileLimit = 2 * 1024 * 1024;
const urlHeaders = new Set(['url', 'website', 'web site', 'login uri', 'uri', 'site', 'login url']);
const webProtocol = /^https?:\/\//i;
const explicitProtocol = /^[a-z][a-z0-9+.-]*:\/\//i;
export const inventoryChoices = {
  review: 'To review',
  keep: 'Keep',
  close: 'Close',
  unsure: 'Not sure',
} as const;
export type InventoryChoice = keyof typeof inventoryChoices;

export function inventoryDomain(value: string): string | null {
  const candidate = value.trim();
  if (!candidate || candidate.length > 4_096) return null;
  if (!webProtocol.test(candidate) && (candidate.includes('@') || explicitProtocol.test(candidate))) return null;
  try {
    const url = new URL(webProtocol.test(candidate) ? candidate : 'https://' + candidate);
    const parsed = parseDomain(url.hostname, { allowPrivateDomains: true });
    return parsed.isIcann || parsed.isPrivate ? parsed.domain : null;
  } catch {
    return null;
  }
}

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

export function companyFor(domain: string) {
  if (Object.hasOwn(directory, domain)) return directory[domain as keyof typeof directory];
}
