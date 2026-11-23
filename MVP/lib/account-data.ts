import { cleanupStore } from './cleanup.ts';
import { exposureStore } from './exposure-store.ts';
import { liveCheck, type Config, type Identity } from './live.ts';

export async function exportAccount(config: Config, token: string, identity: Identity) {
  const live = liveCheck(config);
  const cleanup = cleanupStore(config);
  const [{ check, progress }, cleanupInventory, draftPermissionHistory, closureDrafts, breachedAccountUse, experimentEvents, exposureAudit] =
    await Promise.all([
      live.read(token, identity),
      cleanup.inventory(identity.id),
      cleanup.permissionHistory(identity.id),
      cleanup.closureDrafts(identity.id),
      live.readAccountUse(token, identity),
      live.readEvents(token, identity),
      exposureStore(config).read(token, identity.id),
    ]);
  return new Response(JSON.stringify({
    account: { id: identity.id, email: identity.email, emailVerifiedAt: identity.verifiedAt },
    check: check ?? null,
    fixProgress: progress,
    cleanupInventory,
    draftPermissionHistory,
    closureDrafts,
    breachedAccountUse,
    experimentEvents,
    exposureAudit,
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="koverr-export.json"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
