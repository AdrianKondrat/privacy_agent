import {
  companyFor, inventoryChoices, inventoryDomain, inventoryFileLimit,
  inventoryLimit, parseInventoryCsv, type InventoryChoice,
} from './inventory.ts';

export function mountInventory() {
  const root = document.querySelector('[data-inventory]');
  const file = root?.querySelector<HTMLInputElement>('#inventory-file');
  const manual = root?.querySelector<HTMLFormElement>('#inventory-manual');
  const website = root?.querySelector<HTMLInputElement>('#inventory-website');
  const sample = root?.querySelector<HTMLButtonElement>('[data-inventory-sample]');
  const message = root?.querySelector('[data-inventory-message]');
  const results = root?.querySelector<HTMLElement>('[data-inventory-results]');
  const list = root?.querySelector('[data-inventory-list]');
  const count = root?.querySelector('[data-inventory-count]');
  const clear = root?.querySelector<HTMLButtonElement>('[data-inventory-clear]');
  if (!file || !manual || !website || !sample || !message || !results || !list || !count || !clear) return;

  const accounts = new Map<string, InventoryChoice>();
  let importing = false;
  const announce = (text: string) => { message.textContent = text; };
  const updateCount = () => {
    const close = [...accounts.values()].filter((choice) => choice === 'close').length;
    count.textContent = accounts.size + (accounts.size === 1 ? ' website' : ' websites') + ' · ' + close + ' marked for closure';
    results.hidden = accounts.size === 0;
  };

  function createRow(domain: string) {
    const company = companyFor(domain);
    const row = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = company ? company.name + ' · ' + domain : domain;
    const status = document.createElement('p');
    status.className = 'check-meta';
    status.textContent = company ? 'Official closure guide available' : 'Closure route to review';
    info.append(title, status);

    const choice = document.createElement('select');
    choice.className = 'inventory-choice';
    choice.setAttribute('aria-label', 'Decision for ' + domain);
    for (const [value, label] of Object.entries(inventoryChoices)) choice.add(new Option(label, value));

    const guidance = document.createElement('p');
    guidance.className = 'inventory-guidance';
    guidance.hidden = true;
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

    choice.addEventListener('change', () => {
      const value = choice.value;
      if (!Object.hasOwn(inventoryChoices, value)) return;
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
      rows.append(createRow(domain));
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
  sample.addEventListener('click', () => addDomains(['google.com', 'apple.com', 'live.com', 'wikipedia.org', 'bbc.co.uk']));
  clear.addEventListener('click', () => {
    accounts.clear();
    list.replaceChildren();
    updateCount();
    announce('Cleared the website list.');
    website.focus();
  });

  file.disabled = false;
  website.disabled = false;
  sample.disabled = false;
  const submit = manual.querySelector('button');
  if (submit) submit.disabled = false;
}
