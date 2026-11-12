import test from 'node:test';
import assert from 'node:assert/strict';
import { readAccountUseChange, sampleAccountUse } from '../lib/account-use.ts';
import { sampleFindings } from '../lib/sample.ts';

test('accepts a closure preference only for a finding with a visible fix plan', () => {
  const fields = new FormData();
  fields.set('breach', sampleFindings[0].id);
  fields.set('use', 'close');
  assert.deepEqual(readAccountUseChange(sampleFindings, fields), {
    id: sampleFindings[0].id, choice: 'close', index: 0,
  });
  fields.set('breach', sampleFindings[3].id);
  assert.equal(readAccountUseChange(sampleFindings, fields), null);
  fields.set('breach', sampleFindings[0].id);
  fields.set('use', 'closed');
  assert.equal(readAccountUseChange(sampleFindings, fields), null);
});

test('ignores unknown findings and invalid values in the sample store', () => {
  const valid = sampleFindings[0].id;
  const invalid = sampleFindings[1].id;
  assert.deepEqual(sampleAccountUse(sampleFindings, JSON.stringify({ [valid]: 'keep', [invalid]: 'closed', stranger: 'close' })), {
    [valid]: 'keep',
  });
});
