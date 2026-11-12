import type { Breach } from './findings.ts';

export type BreachCheck = { state: 'complete'; breaches: Breach[] } | { state: 'failed' };

export async function checkBreaches(email: string, apiKey: string, request = fetch): Promise<BreachCheck> {
  const endpoint = new URL(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`);
  endpoint.searchParams.set('truncateResponse', 'false');
  endpoint.searchParams.set('includeUnverified', 'false');
  try {
    const response = await request(endpoint, {
      headers: { 'hibp-api-key': apiKey, 'user-agent': 'Koverr Free Leak Check' },
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return { state: 'complete', breaches: [] };
    if (!response.ok) return { state: 'failed' };
    const records: unknown = await response.json();
    if (!Array.isArray(records)) return { state: 'failed' };

    const breaches = new Map<string, Breach>();
    for (const record of records) {
      if (
        !record || typeof record.Name !== 'string' || !record.Name ||
        typeof record.Title !== 'string' || !record.Title ||
        typeof record.BreachDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.BreachDate) ||
        !Number.isFinite(Date.parse(record.BreachDate)) ||
        !Array.isArray(record.DataClasses) || !record.DataClasses.every((item: unknown) => typeof item === 'string')
      ) return { state: 'failed' };
      if (record.IsFabricated || record.IsRetired || record.IsSensitive || record.IsVerified === false) continue;
      breaches.set(record.Name, {
        id: record.Name, title: record.Title, date: record.BreachDate, dataClasses: record.DataClasses,
        stealer: record.IsStealerLog === true,
      });
    }
    return { state: 'complete', breaches: [...breaches.values()] };
  } catch {
    return { state: 'failed' };
  }
}
