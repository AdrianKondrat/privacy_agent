import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { isVariant, regionKey, variants, worryKey, type Variant } from '../../lib/launch';
import { saveAnswers, saveSignup } from '../../lib/waitlist';

const maxBytes = 4096;
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

async function readForm(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/x-www-form-urlencoded') return;
  if (Number(request.headers.get('content-length')) > maxBytes || !request.body) return;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        void reader.cancel().catch(() => {});
        return;
      }
      body += decoder.decode(value, { stream: true });
    }
    return new URLSearchParams(body + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

export const POST: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.WAITLIST_ORIGIN ?? import.meta.env.WAITLIST_ORIGIN ?? url.origin;
  if (origin !== allowedOrigin) return new Response(null, { status: 403, headers: { 'Cache-Control': 'no-store' } });

  let fields: URLSearchParams | undefined;
  try { fields = await readForm(request); } catch { /* Unreadable form. */ }
  const requested = fields?.get('variant');
  const variant: Variant = isVariant(requested) ? requested : 'director';
  const placement = fields?.get('placement') === 'launch-signup' ? 'launch-signup' : 'hero-signup';
  const response = (status: 'ok' | 'invalid' | 'unavailable', code: number, token?: string) => {
    const headers = { 'Cache-Control': 'no-store' };
    if (request.headers.get('accept')?.includes('application/json')) return Response.json({ status, ...(token && { token }) }, { status: code, headers });
    return new Response(null, { status: 303, headers: { ...headers, Location: variants[variant].path + '?signup=' + status + '&form=' + placement + '#' + placement } });
  };

  // Second step: the optional answers, matched to the signup by the token the first step returned.
  if (fields?.get('step') === 'answers') {
    const token = fields.get('token') ?? '';
    if (!/^[0-9a-f]{32}$/.test(token)) return response('ok', 200);
    try {
      saveAnswers(token, regionKey(fields.get('region')), worryKey(fields.get('worry')));
      return response('ok', 200);
    } catch {
      console.error('[waitlist] Could not write answers to the configured database.');
      return response('unavailable', 503);
    }
  }

  // The honeypot path answers exactly like a real signup, with a token that matches nothing.
  if (fields?.get('website')) return response('ok', 200, randomBytes(16).toString('hex'));
  const email = fields?.get('email')?.trim() ?? '';
  const local = email.split('@')[0];
  if (email.length > 254 || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !emailPattern.test(email)) {
    return response('invalid', 400);
  }
  try {
    return response('ok', 200, saveSignup(email, variant));
  } catch {
    console.error('[waitlist] Could not write signup to the configured database.');
    return response('unavailable', 503);
  }
};
