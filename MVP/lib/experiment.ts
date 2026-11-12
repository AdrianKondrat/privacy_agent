export const planChoices = {
  'once': { label: '£49 once', detail: '90 days of guided cleanup' },
  'monthly': { label: '£12 a month', detail: 'Ongoing help with exposed data' },
  'later': { label: 'Not now', detail: 'Keep using the free check' },
} as const;

export type PlanChoice = keyof typeof planChoices;
export type EventName = 'email_verified' | 'check_completed' | 'results_seen' | 'first_fix_done' | 'plan_choice';
export type ProductEvent = { event_name: EventName; happened_at: string; choice: PlanChoice | null };

export function readPlanChoice(value: unknown): PlanChoice | undefined {
  if (typeof value === 'string' && Object.hasOwn(planChoices, value)) return value as PlanChoice;
}
