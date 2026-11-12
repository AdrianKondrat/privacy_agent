import { inventoryDomain, inventoryLimit, inventoryChoices, type InventoryChoice } from './inventory.ts';

function canonicalDomain(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 253 && inventoryDomain(value) === value;
}

export function parseInventoryImport(value: unknown): string[] | null {
  if (!value || typeof value !== 'object' || Object.keys(value).length !== 1 || !('domains' in value)) return null;
  const { domains } = value;
  if (!Array.isArray(domains) || domains.length < 1 || domains.length > inventoryLimit || !domains.every(canonicalDomain)) return null;
  return [...new Set(domains)];
}

export function parseInventoryDecision(value: unknown): { domain: string; choice: InventoryChoice } | null {
  if (!value || typeof value !== 'object' || Object.keys(value).length !== 2 || !('domain' in value) || !('choice' in value)) return null;
  const { domain, choice } = value;
  return canonicalDomain(domain) && typeof choice === 'string' && Object.hasOwn(inventoryChoices, choice)
    ? { domain, choice: choice as InventoryChoice } : null;
}
