import {
  companyFor, inventoryChoices, inventoryDomain, inventoryFileLimit,
  inventoryLimit, parseInventoryCsv, type InventoryChoice,
} from './inventory.ts';

export async function mountInventory(root: HTMLElement) {
  const saved = root.hasAttribute('data-inventory-saved');
  const endpoint = '/app/cleanup/inventory/';
  const file = root?.querySelector<HTMLInputElement>('#inventory-file');
  const manual = root?.querySelector<HTMLFormElement>('#inventory-manual');
  const website = root?.querySelector<HTMLInputElement>('#inventory-website');
  const sample = root?.querySelector<HTMLButtonElement>('[data-inventory-sample]');
  const message = root?.querySelector('[data-inventory-message]');
  const results = root?.querySelector<HTMLElement>('[data-inventory-results]');
  const list = root?.querySelector('[data-inventory-list]');
  const count = root?.querySelector('[data-inventory-count]');
  const clear = root?.querySelector<HTMLButtonElement>('[data-inventory-clear]');
  const save = root.querySelector<HTMLButtonElement>('[data-inventory-save]');
  if (!file || !manual || !website || !message || !results || !list || !count || !clear) return;

  const accounts = new Map<string, InventoryChoice>();
  const persisted = new Set<string>();
  const matches = new Set<string>();
  let importing = false;
  let saving = false;
  const announce = (text: string) => { message.textContent = text; };
  const updateCount = () => {
    const close = [...accounts.values()].filter((choice) => choice === 'close').length;
    count.textContent = accounts.size + (accounts.size === 1 ? ' website' : ' websites') + ' · ' + close + ' marked for closure';
    results.hidden = accounts.size === 0;
    if (save) {
      const unsaved = accounts.size - persisted.size;
      save.hidden = unsaved === 0;
      clear.hidden = unsaved === 0;
      save.textContent = 'Save ' + unsaved + (unsaved === 1 ? ' website' : ' websites');
    }
  };

  function createRow(domain: string, current: InventoryChoice) {
    const company = companyFor(domain);
    const row = document.createElement('li');
    row.dataset.inventoryDomain = domain;
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = company ? company.name + ' · ' + domain : domain;
    const status = document.createElement('p');
    status.className = 'check-meta';
    status.textContent = company ? 'Official closure guide available' : 'Closure route to review';
    info.append(title, status);
    if (saved) {
      const match = document.createElement('p');
      match.className = 'check-meta';
      match.textContent = matches.has(domain) ? 'Found in your saved breach results' : 'No domain match in your saved results';
      info.append(match);
    }

    const choice = document.createElement('select');
    choice.className = 'inventory-choice';
    choice.setAttribute('aria-label', 'Decision for ' + domain);
    for (const [value, label] of Object.entries(inventoryChoices)) choice.add(new Option(label, value));

    const guidance = document.createElement('p');
    guidance.className = 'inventory-guidance';
    guidance.hidden = current !== 'close';
    guidance.textContent = company
      ? 'Save any data you need and check active subscriptions before closing. '
      : 'Open the service directly and look for account closure in its privacy settings. If there’s no option, ask its official support team.';
    if (company) {
      const link = document.createElement('a');
      link.href = company.guide;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      link.textContent = 'Read ' + company.name + '’s official guide';
      guidance.append(link);
    }

    choice.value = current;
    choice.disabled = saved && !persisted.has(domain);
    choice.addEventListener('change', async () => {
      const value = choice.value;
      if (!Object.hasOwn(inventoryChoices, value)) return;
      if (saved) {
        choice.disabled = true;
        try {
          const response = await fetch(endpoint, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain, choice: value }),
          });
          if (!response.ok) throw new Error();
        } catch {
          choice.value = accounts.get(domain) ?? 'review';
          announce('Could not save that decision. Try again.');
          return;
        } finally {
          choice.disabled = false;
        }
      }
      accounts.set(domain, value as InventoryChoice);
      guidance.hidden = value !== 'close';
      updateCount();
    });
    row.append(info, choice, guidance);
    return row;
  }

  const addDomains = (domains: string[], skipped = 0) => {
    const added = [...new Set(domains)].filter((domain) => !accounts.has(domain));
    if (accounts.size + added.length > inventoryLimit) {
      announce('The list can hold up to 2,000 websites. Clear it before importing more.');
      return;
    }
    const rows = document.createDocumentFragment();
    for (const domain of added) {
      accounts.set(domain, 'review');
      rows.append(createRow(domain, 'review'));
    }
    list.append(rows);
    updateCount();
    const addedText = added.length ? 'Added ' + added.length + (added.length === 1 ? ' website.' : ' websites.') : 'No new websites found.';
    announce(addedText + (skipped ? ' Skipped ' + skipped + (skipped === 1 ? ' row without a supported website.' : ' rows without a supported website.') : ''));
  };

  file.addEventListener('change', async () => {
    const selected = file.files?.[0];
    if (!selected || importing) return;
    file.value = '';
    if (selected.size > inventoryFileLimit) {
      announce('Choose a CSV smaller than 2 MB.');
      return;
    }
    importing = true;
    file.disabled = true;
    announce('Reading the CSV on this device…');
    try {
      const { domains, skipped } = parseInventoryCsv(await selected.text());
      addDomains(domains, skipped);
    } catch {
      announce('Could not read this CSV. Check that it has a website or URL column and up to 2,000 unique sites.');
    } finally {
      importing = false;
      file.disabled = false;
    }
  });
  manual.addEventListener('submit', (event) => {
    event.preventDefault();
    const domain = inventoryDomain(website.value);
    if (!domain) {
      announce('Enter a public website such as example.com.');
      return;
    }
    website.value = '';
    addDomains([domain]);
  });
  sample?.addEventListener('click', () => addDomains(['google.com', 'apple.com', 'live.com', 'wikipedia.org', 'bbc.co.uk']));
  clear.addEventListener('click', () => {
    if (saving) return;
    for (const row of list.querySelectorAll<HTMLElement>('[data-inventory-domain]')) {
      const domain = row.dataset.inventoryDomain ?? '';
      if (!persisted.has(domain)) {
        accounts.delete(domain);
        row.remove();
      }
    }
    updateCount();
    announce(saved ? 'Discarded unsaved websites.' : 'Cleared the website list.');
    website.focus();
  });

  save?.addEventListener('click', async () => {
    if (saving) return;
    const domains = [...accounts.keys()].filter((domain) => !persisted.has(domain));
    if (!domains.length) return;
    saving = true;
    save.disabled = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domains }),
      });
      if (!response.ok) {
        announce(response.status === 409 ? 'Your saved inventory can hold up to 2,000 websites.' : 'Could not save the websites. Try again.');
        return;
      }
      for (const domain of domains) persisted.add(domain);
      for (const row of list.querySelectorAll<HTMLElement>('[data-inventory-domain]')) {
        const select = row.querySelector('select');
        if (select && persisted.has(row.dataset.inventoryDomain ?? '')) select.disabled = false;
      }
      updateCount();
      announce('Websites saved. You can now record a decision for them.');
    } catch {
      announce('Could not save the websites. Try again.');
    } finally {
      saving = false;
      save.disabled = false;
    }
  });

  if (saved) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error();
      const data: { sites: { domain: string; choice: InventoryChoice }[]; breachDomains: string[] } = await response.json();
      for (const domain of data.breachDomains) matches.add(domain);
      const rows = document.createDocumentFragment();
      for (const { domain, choice } of data.sites) {
        persisted.add(domain);
        accounts.set(domain, choice);
        rows.append(createRow(domain, choice));
      }
      list.append(rows);
      updateCount();
    } catch {
      announce('Could not open the saved inventory. Reload to try again.');
      return;
    }
  }
  file.disabled = false;
  website.disabled = false;
  if (sample) sample.disabled = false;
  const submit = manual.querySelector('button');
  if (submit) submit.disabled = false;
}
