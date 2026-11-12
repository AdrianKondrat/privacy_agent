import test from 'node:test';
import assert from 'node:assert/strict';
import { demoBreaches, demoDate } from '../lib/demo.ts';
import { rankBreaches, stepKey, updateProgress } from '../lib/findings.ts';

test('ranks breach data and attaches data-specific, versioned fixes', () => {
  const findings = rankBreaches(demoBreaches, demoDate);
  assert.deepEqual(findings.slice(0, 3).map(({ id }) => id), ['fieldnote', 'goodroom', 'northline']);
  assert.equal(findings[0].steps[0].id, 'change-password');
  assert.equal(findings[2].steps[0].id, 'review-credit');
  assert.equal(findings[0].playbookVersion, 1);
  assert.equal(findings[0].observedAt, demoDate);
});

test('records a completed or skipped step only for a visible fix, and supports undo', () => {
  const findings = rankBreaches(demoBreaches, demoDate);
  const form = new FormData();
  const key = stepKey(findings[0], findings[0].steps[0]);
  form.set('step', key);
  form.set('outcome', 'done');
  const completed = updateProgress(findings, {}, form, demoDate);
  assert.deepEqual(completed, { [key]: { status: 'done', at: demoDate } });

  form.set('outcome', 'skipped');
  assert.equal(updateProgress(findings, {}, form, demoDate), null);
  form.set('reason', 'Already closed the account.');
  assert.equal(updateProgress(findings, {}, form, demoDate)?.[key].status, 'skipped');

  form.set('outcome', 'undo');
  assert.deepEqual(updateProgress(findings, completed!, form, demoDate), {});
  form.set('step', stepKey(findings[3], findings[3].steps[0]));
  assert.equal(updateProgress(findings, {}, form, demoDate), null);
});
