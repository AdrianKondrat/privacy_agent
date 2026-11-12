import { createHmac, randomUUID } from 'node:crypto';
import type { PlanChoice, ProductEvent } from './experiment.ts';
import { checkBreaches } from './breaches.ts';
import { rankBreaches, resolveProgressChange, type Finding, type Outcome, type Progress } from './findings.ts';

type Identity = { id: string; email: string; verifiedAt: string };
type Session = { token: string; identity: Identity; expiresIn: number };
type Check = {
  attempted_at: string;
  checked_at: string | null;
  state: 'checking' | 'failed' | 'complete';
  findings: Finding[];
};
type AuthUser = { id?: string; email?: string; email_confirmed_at?: string };

export function normalizeEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function verifiedIdentity(user?: AuthUser): Identity | null {
  if (!user?.id || !user.email || !user.email_confirmed_at) return null;
  return { id: user.id, email: user.email, verifiedAt: user.email_confirmed_at };
}

export function liveConfig() {
  const {
    KOVERR_APP_ORIGIN: origin, KOVERR_SUPABASE_URL: url, KOVERR_SUPABASE_PUBLISHABLE_KEY: publicKey,
    KOVERR_SUPABASE_SERVICE_ROLE_KEY: serviceKey, KOVERR_HIBP_API_KEY: hibpKey,
  } = process.env;
  if (!origin || !url || !publicKey || !serviceKey || !hibpKey) return null;
  const app = new URL(origin);
  const supabase = new URL(url);
  for (const endpoint of [app, supabase]) {
    const local = endpoint.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(endpoint.hostname);
    if ((!local && endpoint.protocol !== 'https:') || endpoint.origin !== endpoint.href.slice(0, -1)) {
      throw new Error('Koverr service origins must be HTTPS origins or local development addresses.');
    }
  }
  return { origin: app.origin, url: supabase.origin, publicKey, serviceKey, hibpKey };
}

type Config = NonNullable<ReturnType<typeof liveConfig>>;

class ServiceError extends Error {
  readonly status: number;

  constructor(status: number) {
    super('Koverr service request failed.');
    this.status = status;
  }
}

export function liveCheck(config: Config, request = fetch) {
  async function call<T>(path: string, options: { method?: string; token?: string; admin?: boolean; body?: unknown; prefer?: string } = {}) {
    const { method = 'GET', token, admin, body, prefer } = options;
    const key = admin ? config.serviceKey : config.publicKey;
    const headers = new Headers({ apikey: key });
    if (token || admin) headers.set('authorization', `Bearer ${token ?? key}`);
    if (prefer) headers.set('prefer', prefer);
    if (body !== undefined) headers.set('content-type', 'application/json');
    const response = await request(`${config.url}${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error', signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new ServiceError(response.status);
    const payload = await response.text();
    return (payload ? JSON.parse(payload) : undefined) as T;
  }

  async function identify(token: string): Promise<Identity | null> {
    try {
      return verifiedIdentity(await call<AuthUser>('/auth/v1/user', { token }));
    } catch (error) {
      if (error instanceof ServiceError && [401, 403, 404].includes(error.status)) return null;
      throw error;
    }
  }

  async function sendCode(email: string): Promise<'sent' | 'limited'> {
    const addressKey = createHmac('sha256', config.serviceKey).update(email).digest('hex');
    const allowed = await call<boolean>('/rest/v1/rpc/koverr_claim_otp', {
      method: 'POST', admin: true, body: { address_key_arg: addressKey },
    });
    if (!allowed) return 'limited';
    try {
      await call('/auth/v1/otp', { method: 'POST', body: { email, create_user: true } });
      return 'sent';
    } catch (error) {
      if (error instanceof ServiceError && error.status === 429) return 'limited';
      throw error;
    }
  }

  async function verifyCode(email: string, code: string): Promise<Session | null> {
    try {
      const result = await call<{ access_token: string; expires_in: number; user?: AuthUser }>('/auth/v1/verify', {
        method: 'POST', body: { email, token: code, type: 'email' },
      });
      const identity = verifiedIdentity(result.user);
      if (identity?.email.toLowerCase() !== email || typeof result.access_token !== 'string' ||
          !Number.isFinite(result.expires_in) || result.expires_in < 1) return null;
      return { token: result.access_token, identity, expiresIn: result.expires_in };
    } catch (error) {
      if (error instanceof ServiceError && [400, 401, 403, 422].includes(error.status)) return null;
      throw error;
    }
  }

  async function read(token: string, identity: Identity) {
    const owner = `user_id=eq.${encodeURIComponent(identity.id)}`;
    const [checks, outcomes] = await Promise.all([
      call<Check[]>(`/rest/v1/koverr_checks?${owner}&select=attempted_at,checked_at,state,findings`, { token }),
      call<{ step_key: string; outcome: Outcome }[]>(`/rest/v1/koverr_fix_progress?${owner}&select=step_key,outcome`, { token }),
    ]);
    const progress: Progress = Object.fromEntries(outcomes.map(({ step_key, outcome }) => [step_key, outcome]));
    return { check: checks[0], progress };
  }

  async function readEvents(token: string, identity: Identity) {
    const owner = encodeURIComponent(identity.id);
    return call<ProductEvent[]>(`/rest/v1/koverr_events?user_id=eq.${owner}&select=event_name,happened_at,choice`, { token });
  }

  async function recordEvent(identity: Identity, event: 'email_verified' | 'results_seen') {
    await call('/rest/v1/koverr_events', {
      method: 'POST', admin: true, prefer: 'resolution=ignore-duplicates',
      body: {
        user_id: identity.id, event_name: event,
        ...(event === 'email_verified' && { happened_at: identity.verifiedAt }),
      },
    });
  }

  async function choosePlan(identity: Identity, choice: PlanChoice) {
    return call<boolean>('/rest/v1/rpc/koverr_choose_plan', {
      method: 'POST', admin: true, body: { user_id_arg: identity.id, choice_arg: choice },
    });
  }

  async function scan(token: string): Promise<void> {
    const identity = await identify(token);
    if (!identity) return;
    const claim = randomUUID();
    const allowed = await call<boolean>('/rest/v1/rpc/koverr_claim_scan', {
      method: 'POST', admin: true, body: { user_id_arg: identity.id, claim_id_arg: claim },
    });
    if (!allowed) return;
    const result = await checkBreaches(identity.email, config.hibpKey, request);
    const checkedAt = new Date().toISOString();
    await call(`/rest/v1/koverr_checks?user_id=eq.${encodeURIComponent(identity.id)}&claim_id=eq.${claim}`, {
      method: 'PATCH', admin: true,
      body: result.state === 'complete'
        ? { state: 'complete', checked_at: checkedAt, findings: rankBreaches(result.breaches, checkedAt) }
        : { state: 'failed' },
    });
  }

  async function saveProgress(identity: Identity, findings: Finding[], fields: FormData) {
    const change = resolveProgressChange(findings, fields, new Date().toISOString());
    if (!change) return false;
    if (change.outcome) {
      await call('/rest/v1/koverr_fix_progress', {
        method: 'POST', admin: true, prefer: 'resolution=merge-duplicates',
        body: { user_id: identity.id, step_key: change.key, outcome: change.outcome },
      });
    } else {
      const filters = new URLSearchParams({ user_id: `eq.${identity.id}`, step_key: `eq.${JSON.stringify(change.key)}` });
      await call(`/rest/v1/koverr_fix_progress?${filters}`, { method: 'DELETE', admin: true });
    }
    return true;
  }

  async function deleteAccount(identity: Identity) {
    try {
      await call(`/auth/v1/admin/users/${encodeURIComponent(identity.id)}`, {
        method: 'DELETE', admin: true, body: { should_soft_delete: false },
      });
    } catch (error) {
      if (!(error instanceof ServiceError && error.status === 404)) throw error;
    }
  }

  return { identify, sendCode, verifyCode, read, readEvents, recordEvent, choosePlan, scan, saveProgress, deleteAccount };
}
