import { supabaseRequest, type Config } from './live.ts';
import type { Audit } from './exposure.ts';

export type AuditRecord = { revision: number; expires_at: string; data: Audit };
const table = '/rest/v1/koverr_exposure_audits';

export function exposureStore(config: Config, request = fetch) {
  const call = supabaseRequest(config, request);
  const owner = (id: string) => `user_id=eq.${encodeURIComponent(id)}`;

  return {
    async read(token: string, id: string): Promise<AuditRecord | null> {
      const rows = await call<AuditRecord[]>(`${table}?${owner(id)}&select=revision,expires_at,data`, { token });
      return rows[0] ?? null;
    },
    async write(id: string, revision: number, data: Audit): Promise<boolean> {
      const previous = revision > 0;
      const rows = await call<{ revision: number }[]>(previous
        ? `${table}?${owner(id)}&revision=eq.${revision}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=revision`
        : `${table}?on_conflict=user_id&select=revision`, {
        admin: true,
        method: previous ? 'PATCH' : 'POST',
        prefer: previous ? 'return=representation' : 'return=representation,resolution=ignore-duplicates',
        body: previous ? { revision: revision + 1, data } : { user_id: id, revision: 1, data },
      });
      return rows.length === 1;
    },
  };
}
