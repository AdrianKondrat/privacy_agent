import type { APIRoute } from 'astro';
import { cleanupSession, hasCleanupAccess, readInventoryJson } from '../lib/cleanup.ts';
import { parseInventoryDecision, parseInventoryImport } from '../lib/inventory-payload.ts';

const reply = (value: unknown, status = 200) => Response.json(value, {
  status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
});

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const session = await cleanupSession(url, cookies);
    if (!session) return reply({}, 401);
    const { store, user, live, token } = session;
    if (!hasCleanupAccess(await store.access(user.id))) return reply({}, 403);
    const [sites, { check }] = await Promise.all([store.inventory(user.id), live.read(token, user)]);
    return reply({
      sites,
      breachDomains: [...new Set(check?.findings.flatMap((finding) => finding.domain ? [finding.domain] : []) ?? [])],
    });
  } catch {
    return reply({}, 503);
  }
};

export const POST: APIRoute = async ({ url, cookies, request }) => {
  if (request.headers.get('origin') !== url.origin) return reply({}, 403);
  try {
    const session = await cleanupSession(url, cookies);
    if (!session) return reply({}, 401);
    const domains = parseInventoryImport(await readInventoryJson(request));
    if (!domains) return reply({}, 400);
    const result = await session.store.importInventory(session.user.id, domains);
    return reply({ result }, { saved: 200, locked: 403, limit: 409, invalid: 400 }[result]);
  } catch {
    return reply({}, 503);
  }
};

export const PATCH: APIRoute = async ({ url, cookies, request }) => {
  if (request.headers.get('origin') !== url.origin) return reply({}, 403);
  try {
    const session = await cleanupSession(url, cookies);
    if (!session) return reply({}, 401);
    const decision = parseInventoryDecision(await readInventoryJson(request));
    if (!decision) return reply({}, 400);
    const saved = await session.store.setInventoryChoice(session.user.id, decision.domain, decision.choice);
    return reply({ saved }, saved ? 200 : 403);
  } catch {
    return reply({}, 503);
  }
};
