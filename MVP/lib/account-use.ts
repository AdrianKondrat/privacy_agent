import type { Finding } from './findings.ts';

export const accountUseChoices = {
  keep: 'Yes, I still use it',
  close: 'No, I no longer use it',
  unsure: 'I’m not sure',
} as const;

export const accountUseMessages = {
  keep: 'Keep the account and work through the security fixes above.',
  close: 'If you can still sign in, look for account closure in the service’s account or privacy settings. Save anything you need first and check for active subscriptions.',
  unsure: 'Look for a recent sign-in or receipt in your own records. Come back once you know whether you need the account.',
} as const;

export type AccountUse = keyof typeof accountUseChoices;
export type AccountUseByBreach = Record<string, AccountUse>;

export function readAccountUse(value: unknown): AccountUse | undefined {
  if (typeof value === 'string' && Object.hasOwn(accountUseChoices, value)) return value as AccountUse;
}

export function readAccountUseChange(findings: Finding[], fields: FormData) {
  const id = fields.get('breach');
  const choice = readAccountUse(fields.get('use'));
  if (typeof id !== 'string' || !choice) return null;
  const index = findings.slice(0, 3).findIndex((finding) => finding.id === id);
  return index < 0 ? null : { id, choice, index };
}

export function sampleAccountUse(findings: Finding[], stored?: string): AccountUseByBreach {
  try {
    const parsed = stored ? JSON.parse(stored) : null;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(findings.slice(0, 3).flatMap(({ id }) => {
      const choice = readAccountUse(parsed[id]);
      return choice ? [[id, choice]] : [];
    }));
  } catch {
    return {};
  }
}
