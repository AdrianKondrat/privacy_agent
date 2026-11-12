import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryDomain, parseInventoryCsv } from '../lib/inventory.ts';

test('browser and Bitwarden CSVs return only unique registrable domains', () => {
  const chrome = '\uFEFFname,url,username,password,note\r\n'
    + 'Mail,https://alice:secret@login.example.co.uk/private?q=private,alice,secret,"one,\n two"\r\n'
    + 'Duplicate,https://www.example.co.uk,another,password,notes\r\n'
    + 'Local,http://127.0.0.1:3000,private,password,notes';
  assert.deepEqual(parseInventoryCsv(chrome), { domains: ['example.co.uk'], skipped: 1 });
  const bitwarden = 'name,login_uri,login_username,login_password\n'
    + 'Team,https://signin.example.github.io,alice,secret';
  assert.deepEqual(parseInventoryCsv(bitwarden), { domains: ['example.github.io'], skipped: 0 });
});

test('manual inventory handles public domains and ignores raw emails and non-web URLs', () => {
  assert.equal(inventoryDomain('login.example.co.uk:443/account'), 'example.co.uk');
  assert.equal(inventoryDomain('alice@example.com'), null);
  assert.equal(inventoryDomain('ftp://example.com'), null);
  assert.equal(inventoryDomain('https://localhost/login'), null);
  assert.equal(inventoryDomain('https://co.uk'), null);
  assert.throws(() => parseInventoryCsv('title,user,password\nEntry,username,secret'), /website or URL column/);
});

test('300 CSV rows produce a list containing only domains', () => {
  const domains = Array.from({ length: 300 }, (_, index) => 'example' + index + '.com');
  const rows = domains.map((domain) => 'https://auth.' + domain + '/secret,alice,password');
  assert.deepEqual(parseInventoryCsv(['URL,Username,Password', ...rows].join('\n')), { domains, skipped: 0 });
});

test('saved inventory import accepts domains only and rejects extra fields', async () => {
  const { parseInventoryImport, parseInventoryDecision } = await import('../lib/inventory-payload.ts');
  assert.deepEqual(parseInventoryImport({ domains: ['example.co.uk', 'example.co.uk'] }), ['example.co.uk']);
  for (const payload of [
    { domains: ['https://example.com/private'] },
    { domains: ['login.example.com'] },
    { domains: ['example.com'], password: 'private' },
    { domains: [{ domain: 'example.com', username: 'alice' }] },
  ]) assert.equal(parseInventoryImport(payload), null);
  assert.deepEqual(parseInventoryDecision({ domain: 'example.com', choice: 'close' }), { domain: 'example.com', choice: 'close' });
  assert.equal(parseInventoryDecision({ domain: 'example.com', choice: 'close', note: 'private' }), null);
});
