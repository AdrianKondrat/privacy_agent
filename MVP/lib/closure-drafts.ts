import template from '../templates/account-closure.v1.json' with { type: 'json' };

export const closureTemplateVersion = template.version;
export type DraftState = 'pending' | 'ready' | 'declined' | 'cancelled';
export type ClosureDraft = {
  id: string;
  domain: string;
  company_name: string;
  template_version: number;
  state: DraftState;
  created_at: string;
  reviewed_at: string | null;
  review_outcome: 'ready' | 'declined' | null;
  review_minutes: number | null;
};

export const draftStateLabels: Record<DraftState, string> = {
  pending: 'Awaiting founder review',
  ready: 'Ready to copy',
  declined: 'Declined at review',
  cancelled: 'Cancelled',
};

export function renderClosureDraft(version: number, company: string, email: string) {
  if (version !== closureTemplateVersion || !company.trim() || company.length > 80 || /[\r\n{}]/.test(company)
      || !email.trim() || email.length > 254 || /[\u0000-\u001f\u007f]/.test(email)) return null;
  const values = { company, email };
  const fill = (text: string) => text.replace(/{{(company|email)}}/g, (_, key: keyof typeof values) => values[key]);
  return { subject: fill(template.subject), body: fill(template.body) };
}

export function readDraftReview(fields: FormData) {
  const id = fields.get('draft');
  const outcome = fields.get('outcome');
  const duration = fields.get('minutes');
  if (typeof id !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)
      || (outcome !== 'ready' && outcome !== 'declined')
      || typeof duration !== 'string' || !/^\d{1,4}$/.test(duration) || Number(duration) > 1440) return null;
  return { id, outcome, minutes: Number(duration) } as const;
}
