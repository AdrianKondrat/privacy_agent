import playbook from '../playbooks/stolen.v1.json' with { type: 'json' };

export interface Breach {
  id: string;
  title: string;
  date: string;
  dataClasses: string[];
  stealer?: boolean;
}

export interface Step {
  id: string;
  title: string;
  instructions: string;
  minutes: number;
  level: 'L0';
}

export function rankBreaches(breaches: Breach[], checkedAt: string) {
  return breaches.map((breach) => {
    const matches = playbook.branches.filter((branch) =>
      branch.classes.some((dataClass) => breach.dataClasses.includes(dataClass)),
    );
    const branches = breach.stealer ? [playbook.stealer] : matches;
    const lead = branches[0] ?? playbook.fallback;
    const steps: Step[] = (branches.length ? branches : [lead]).flatMap((branch) =>
      branch.steps.map((step) => ({ ...step, level: 'L0' })),
    );
    const age = (Date.parse(checkedAt) - Date.parse(breach.date)) / 86_400_000;
    const freshness = age <= 365 ? 1 : age <= 1_095 ? 0.7 : 0.4;
    const priority = (lead.sensitivity * 4 * freshness * lead.chance) / steps[0].minutes;

    return { ...breach, observedAt: checkedAt, playbookVersion: playbook.version, reason: lead.reason, steps, priority };
  }).sort((a, b) => b.priority - a.priority || b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export type Finding = ReturnType<typeof rankBreaches>[number];
export type Outcome = { status: 'done' | 'skipped'; at: string; reason?: string };
export type Progress = Record<string, Outcome>;

export const stepKey = (finding: Finding, step: Step) => JSON.stringify([finding.id, finding.playbookVersion, step.id]);

export function resolveProgressChange(findings: Finding[], fields: FormData, at: string): { key: string; outcome: Outcome | null } | null {
  const key = fields.get('step');
  const status = fields.get('outcome');
  const reason = fields.get('reason');
  if (typeof key !== 'string' || (status !== 'done' && status !== 'skipped' && status !== 'undo')) return null;
  if (status === 'skipped' && (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 120)) return null;
  if (!findings.slice(0, 3).some((finding) => finding.steps.some((step) => stepKey(finding, step) === key))) return null;
  const outcome: Outcome | null = status === 'skipped' ? { status, at, reason: String(reason).trim() }
    : status === 'done' ? { status, at } : null;
  return { key, outcome };
}

export function updateProgress(findings: Finding[], progress: Progress, fields: FormData, at: string): Progress | null {
  const change = resolveProgressChange(findings, fields, at);
  if (!change) return null;
  const updated = { ...progress };
  if (change.outcome) updated[change.key] = change.outcome;
  else delete updated[change.key];
  return updated;
}
