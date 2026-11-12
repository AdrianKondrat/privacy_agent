import test from 'node:test';
import assert from 'node:assert/strict';
import { draftPermissionVersion, permissionIntent } from '../lib/draft-permission.ts';

test('draft permission requires affirmative agreement to the current version', () => {
  const fields = new FormData();
  fields.set('intent', 'grant-permission');
  assert.equal(permissionIntent(fields), null);
  fields.set('agreement', String(draftPermissionVersion + 1));
  assert.equal(permissionIntent(fields), null);
  fields.set('agreement', String(draftPermissionVersion));
  assert.equal(permissionIntent(fields), 'grant');
  fields.delete('agreement');
  fields.set('intent', 'revoke-permission');
  assert.equal(permissionIntent(fields), 'revoke');
});
