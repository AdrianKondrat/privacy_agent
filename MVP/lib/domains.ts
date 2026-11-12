import { parse as parseDomain } from 'tldts';

const webProtocol = /^https?:\/\//i;
const explicitProtocol = /^[a-z][a-z0-9+.-]*:\/\//i;

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
