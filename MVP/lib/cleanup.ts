import type { AstroCookies } from 'astro';
import { liveCheck, liveConfig, supabaseRequest, type Config } from './live.ts';
import { knownDomains, type InventoryChoice } from './inventory.ts';

export type SavedSite = { domain: string; choice: InventoryChoice; updated_at: string };
const sessionCookie = 'koverr_check_session';

export function cleanupStore(config: Config, request = fetch) {
  const call = supabaseRequest(config, request);
  const owner = (id: string) => 'user_id=eq.' + encodeURIComponent(id);
  const read = <T>(path: string) => call<T>('/rest/v1/' + path, { admin: true });
  const rpc = <T>(name: string, body: Record<string, unknown>) =>
    call<T>('/rest/v1/rpc/' + name, { admin: true, method: 'POST', body });

  return {
    async access(id: string) {
      const rows = await read<{ expires_at: string }[]>('koverr_cleanup_access?' + owner(id) + '&select=expires_at');
      return rows[0] ?? null;
    },
    async inventory(id: string) {
      return rpc<SavedSite[]>('koverr_read_inventory', { user_id_arg: id });
    },
    importInventory: (id: string, domains: string[]) =>
      rpc<'saved' | 'limit' | 'locked' | 'invalid'>('koverr_import_inventory', { user_id_arg: id, domains_arg: domains }),
    setInventoryChoice: (id: string, domain: string, choice: InventoryChoice) =>
      rpc<boolean>('koverr_set_inventory_choice', { user_id_arg: id, domain_arg: domain, choice_arg: choice }),
    directoryResearch: () =>
      rpc<{ domain: string; accounts: number }[]>('koverr_directory_research', { known_domains_arg: knownDomains }),
  };
}

export async function cleanupSession(url: URL, cookies: AstroCookies) {
  const config = liveConfig();
  const token = cookies.get(sessionCookie)?.value;
  if (!token || !config || config.origin !== url.origin) return null;
  const live = liveCheck(config);
  const user = await live.identify(token);
  if (!user) return null;
  const store = cleanupStore(config);
  return { user, live, token, store, config };
}

export function hasCleanupAccess(access: { expires_at: string } | null) {
  return !!access && Date.parse(access.expires_at) > Date.now();
}

export function isReviewer(id: string) {
  return (process.env.KOVERR_CONCIERGE_REVIEWER_IDS ?? '').split(',').map((item) => item.trim()).includes(id);
}

export async function readInventoryJson(request: Request): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json' || !request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let body = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 520_000) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}
