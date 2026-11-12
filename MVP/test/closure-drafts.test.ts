import test from 'node:test';
import assert from 'node:assert/strict';
import { closureTemplateVersion, readDraftReview, renderClosureDraft } from '../lib/closure-drafts.ts';

test('the closure draft substitutes the two fixed slots without interpreting slot text', () => {
  const draft = renderClosureDraft(closureTemplateVersion, 'Fieldnote', 'alex+$&@example.test');
  assert.deepEqual(draft, {
    subject: 'Request to close my Fieldnote account',
    body: 'Hello Fieldnote support,\n\nI would like to close my personal account associated with alex+$&@example.test. Please tell me if I need to complete any steps in my account settings, and confirm when the account is closed.\n\nThank you.',
  });
  assert.equal(renderClosureDraft(2, 'Fieldnote', 'alex@example.test'), null);
  assert.equal(renderClosureDraft(1, 'Fieldnote\nCc: outsider@example.test', 'alex@example.test'), null);
  assert.ok(renderClosureDraft(1, 'Fieldnote', 'alex{tag}@example.test')?.body.includes('alex{tag}@example.test'));
  assert.equal(renderClosureDraft(1, 'Fieldnote', 'alex\n@example.test'), null);
});

test('review input is limited to a draft UUID, two outcomes and whole minutes', () => {
  const fields = new FormData();
  const id = '981bc6d9-0032-438f-b1f4-19f15da01263';
  fields.set('draft', id);
  fields.set('outcome', 'ready');
  fields.set('minutes', '2');
  assert.deepEqual(readDraftReview(fields), { id, outcome: 'ready', minutes: 2 });
  fields.set('minutes', '-1');
  assert.equal(readDraftReview(fields), null);
  fields.set('minutes', '2');
  fields.set('outcome', 'sent');
  assert.equal(readDraftReview(fields), null);
});
