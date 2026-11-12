export const draftPermissionVersion = 1;
export const draftPermissionText =
  'I authorise Koverr to prepare and review account-closure drafts for the websites I select in Cleanup. I decide whether to use each draft. This permission covers preparing drafts only, and I can withdraw it here at any time.';

export type DraftPermission = { active: boolean; version: number; changed_at: string };
export type DraftPermissionEvent = { event: 'granted' | 'revoked'; version: number; happened_at: string };

export function permissionIntent(fields: FormData): 'grant' | 'revoke' | null {
  const intent = fields.get('intent');
  if (intent === 'revoke-permission') return 'revoke';
  if (intent === 'grant-permission' && fields.get('agreement') === String(draftPermissionVersion)) return 'grant';
  return null;
}
