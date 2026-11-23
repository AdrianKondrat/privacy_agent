import { auditSources, deepSources, quickSources, optionalRoutes, removalTargets, type SourceId, type TargetId } from './exposure-sources.ts';

export const identifierTypes = {
  'name-town': 'Name and town',
  phone: 'Phone number',
  username: 'Username',
} as const;
export const dataTypes = {
  name: 'Name',
  address: 'Address',
  phone: 'Phone number',
  email: 'Email address',
  username: 'Username',
} as const;
export const checkLabels = {
  'not-checked': 'Not checked',
  failed: 'Check failed',
  none: 'No matches in this source',
  possible: 'Possible match',
} as const;
export const decisions = { mine: 'Mine', rejected: 'Not mine', unsure: 'Unsure' } as const;
export const caseUpdates = {
  submitted: 'Submitted',
  waiting: 'Waiting',
  action: 'Needs your action',
  'removal-reported': 'Removal reported',
  'search-removed': 'Search result removed',
  'marketing-suppressed': 'Marketing suppressed',
  'register-opted-out': 'Open register opt-out confirmed',
  refused: 'Refused',
  unanswered: 'No response',
  withdrawn: 'Withdrawn',
  'recheck-visible': 'Listing still visible',
  'recheck-absent': 'Listing no longer visible',
  'recheck-indexed': 'Search result still visible',
  'recheck-delisted': 'Search result no longer visible',
  'recheck-failed': 'Inconclusive recheck',
} as const;
export const nextSteps = {
  reply: 'Reply to the organization',
  follow: 'Follow up with the organization',
  recheck: 'Check the source again',
} as const;

type Identifier = keyof typeof identifierTypes;
type DataType = keyof typeof dataTypes;
type Decision = keyof typeof decisions;
type CaseUpdate = keyof typeof caseUpdates;
type NextStep = keyof typeof nextSteps;
type Check = { status: Exclude<keyof typeof checkLabels, 'possible'>; at: string } | {
  status: 'possible'; at: string; url: string; dataType: DataType; observation: 'page' | 'index';
  exactIdentifier?: true; decision?: Decision;
};
type Case = {
  openedAt: string;
  events: { type: CaseUpdate; at: string; submissionDate?: string; next?: NextStep; due?: string }[];
};
export type Audit = {
  country: 'GB';
  terms: 1;
  startedAt: string;
  identifiers: Identifier[];
  deeper: boolean;
  checks: Partial<Record<SourceId, Check>>;
  cases: Partial<Record<TargetId, Case>>;
  assistedSession?: { minutes: number; userMinutes: number; at: string };
};

function option<K extends string>(value: FormDataEntryValue | null, options: Record<K, unknown>): K | null {
  return typeof value === 'string' && Object.hasOwn(options, value) ? value as K : null;
}

function sourceUrl(value: FormDataEntryValue | null, source: SourceId): string | null {
  if (typeof value !== 'string' || value.length > 512) return null;
  try {
    const url = new URL(value.trim());
    const hosts: readonly string[] = auditSources[source].hosts;
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !url.hostname.includes('.') || !/[a-z]$/i.test(url.hostname) || url.pathname === '/' ||
      (hosts.length > 0 && !hosts.includes(url.hostname))) return null;
    url.search = '';
    url.hash = '';
    return url.href.length <= 384 ? url.href : null;
  } catch {
    return null;
  }
}

function date(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = new Date(value);
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 10) === value ? value : null;
}

export function activeSources(audit: Audit) {
  return audit.deeper ? deepSources : quickSources;
}

export function canStartPlan(audit: Audit) {
  return quickSources.every((source) => audit.checks[source]);
}

export function permittedUpdates(source: TargetId, record: Case): CaseUpdate[] {
  const last = record.events.at(-1)?.type;
  if (!last) return ['submitted'];
  if (last === 'withdrawn') return [];
  const common: CaseUpdate[] = ['waiting', 'action', 'refused', 'unanswered', 'withdrawn'];
  switch (removalTargets[source].goal) {
    case 'listing': return [...common, 'removal-reported', 'recheck-visible', 'recheck-absent', 'recheck-failed'];
    case 'search': return [...common, 'search-removed', 'recheck-indexed', 'recheck-delisted', 'recheck-failed'];
    case 'marketing': return [...common, 'marketing-suppressed'];
    case 'register': return [...common, 'register-opted-out'];
  }
}

type Update = { data: Audit } | { error: string };

export function updateExposure(previous: Audit | null, fields: FormData, now: string): Update {
  const intent = fields.get('intent');
  if (!previous) {
    if (intent !== 'start' || fields.get('country') !== 'GB' || fields.get('agreement') !== 'yes') {
      return { error: 'Select the United Kingdom and confirm the audit agreement.' };
    }
    const identifiers = Object.keys(identifierTypes).filter((key) => fields.getAll('identifier').includes(key)) as Identifier[];
    return { data: { country: 'GB', terms: 1, startedAt: now, identifiers, deeper: false, checks: {}, cases: {} } };
  }

  if (intent === 'expand' && canStartPlan(previous)) return { data: { ...previous, deeper: true } };
  if (intent === 'assisted-session') {
    const minutes = fields.get('minutes');
    const userMinutes = fields.get('user-minutes');
    if (typeof minutes !== 'string' || !/^\d{1,3}$/.test(minutes) || Number(minutes) > 180 ||
        typeof userMinutes !== 'string' || !/^\d{1,3}$/.test(userMinutes) || Number(userMinutes) > 180) {
      return { error: 'Enter whole minutes from 0 to 180 for each person.' };
    }
    return { data: { ...previous, assistedSession: { minutes: Number(minutes), userMinutes: Number(userMinutes), at: now } } };
  }

  const target = option(fields.get('source'), removalTargets);
  if (!target) return { error: 'Select a source in your audit.' };
  const record = previous.cases[target];
  const source = option(target, auditSources);
  if (source) {
    if (!activeSources(previous).includes(source)) return { error: 'Select a source in your audit.' };
    const old = previous.checks[source];
    if (intent === 'record-check' && !record) {
      const status = option(fields.get('status'), checkLabels);
      if (!status) return { error: 'Select a check result.' };
      let check: Check;
      if (status === 'possible') {
        const url = sourceUrl(fields.get('url'), source);
        const dataType = option(fields.get('data-type'), dataTypes);
        const observation = fields.get('observation') === 'index' && source === 'google' ? 'index' : 'page';
        if (!url || !dataType) return { error: 'Enter an HTTPS result page from this check and select the type of information.' };
        if (Object.entries(previous.checks).some(([id, match]) => id !== source && match.status === 'possible' && match.url === url &&
          auditSources[id as SourceId].goal === auditSources[source].goal)) {
          return { error: 'This page is already a possible match for this type of removal.' };
        }
        const exactIdentifier = fields.get('exact') === 'yes' && observation === 'page' && (dataType === 'email' || dataType === 'phone');
        check = { status, at: now, url, dataType, observation, ...(exactIdentifier && { exactIdentifier: true }) };
      } else {
        check = { status, at: now };
      }
      return { data: { ...previous, checks: { ...previous.checks, [source]: check } } };
    }
    if (old?.status !== 'possible') return { error: 'Record a possible match first.' };
    if (intent === 'decide' && !record) {
      const decision = option(fields.get('decision'), decisions);
      if (!decision) return { error: 'Select Mine, Not mine, or Unsure.' };
      return { data: { ...previous, checks: { ...previous.checks, [source]: { ...old, decision } } } };
    }
    if (old.decision !== 'mine') return { error: 'Confirm that the match is yours before you track a request.' };
  } else if (!Object.hasOwn(optionalRoutes, target) || !previous.deeper ||
    (!record && fields.get('optional') !== 'yes')) {
    return { error: 'Confirm that you want to track this optional opt-out.' };
  }
  if (intent === 'open-case') {
    return { data: record ? previous : { ...previous, cases: { ...previous.cases, [target]: { openedAt: now, events: [] } } } };
  }
  if (intent === 'discard-case' && record?.events.length === 0) {
    const cases = { ...previous.cases };
    delete cases[target];
    return { data: { ...previous, cases } };
  }
  if (intent !== 'case-update' || !record) return { error: 'Open a case first.' };
  const type = option(fields.get('event'), caseUpdates);
  if (!type || !permittedUpdates(target, record).includes(type) || record.events.length >= 20) {
    return { error: 'This update is unavailable for this case.' };
  }

  const next = option(fields.get('next'), nextSteps);
  const due = date(fields.get('due'));
  const submissionDate = date(fields.get('submission-date'));
  if ((fields.get('due') && (!due || !next)) || (type === 'action' && !next)) {
    return { error: 'Select a next action before you add a follow-up date.' };
  }
  if (type === 'submitted' && (fields.get('sent') !== 'yes' || !submissionDate || submissionDate > now.slice(0, 10))) {
    return { error: 'Confirm actual submission and enter the submission date.' };
  }
  const event = {
    type, at: now,
    ...(type === 'submitted' && submissionDate && { submissionDate }),
    ...(next && { next }),
    ...(due && { due }),
  };
  return { data: { ...previous, cases: { ...previous.cases, [target]: { ...record, events: [...record.events, event] } } } };
}
