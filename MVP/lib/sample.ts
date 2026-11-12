import { demoBreaches, demoDate } from './demo.ts';
import { rankBreaches, stepKey, type Progress } from './findings.ts';

export const sampleFindings = rankBreaches(demoBreaches, demoDate);

export function sampleProgress(stored?: string): Progress {
  const progress: Progress = {};
  try {
    const value = stored ? JSON.parse(stored) : null;
    for (const finding of sampleFindings.slice(0, 3)) {
      for (const step of finding.steps) {
        const key = stepKey(finding, step);
        const outcome = value?.[key];
        if (typeof outcome?.at !== 'string' || !Number.isFinite(Date.parse(outcome.at))) continue;
        if (outcome.status === 'done' || (outcome.status === 'skipped' && typeof outcome.reason === 'string')) {
          progress[key] = outcome;
        }
      }
    }
  } catch {
    // Ignore an unreadable sample cookie.
  }
  return progress;
}
