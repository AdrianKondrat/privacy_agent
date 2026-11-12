import { permissionIntent } from '../lib/draft-permission.ts';

const key = 'koverr-cleanup-preview-permission';

export function mountConciergePreview() {
  const root = document.querySelector('[data-concierge-preview]');
  const grant = root?.querySelector<HTMLFormElement>('[data-permission-grant]');
  const revoke = root?.querySelector<HTMLFormElement>('[data-permission-revoke]');
  const status = root?.querySelector('[data-permission-status]');
  if (!root || !grant || !revoke || !status) return;
  let state = '';
  try { state = sessionStorage.getItem(key) ?? ''; } catch { /* Use page state when storage is unavailable. */ }

  const render = () => {
    grant.hidden = state === 'active';
    revoke.hidden = state !== 'active';
    status.textContent = state === 'active' ? 'Sample permission active' : state === 'revoked' ? 'Sample permission withdrawn' : 'Permission is off';
  };

  for (const form of [grant, revoke]) {
    for (const control of form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button')) control.disabled = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const intent = permissionIntent(new FormData(form, event.submitter));
      if (!intent) return;
      state = intent === 'grant' ? 'active' : 'revoked';
      grant.reset();
      try { sessionStorage.setItem(key, state); } catch { /* Keep the choice on this page. */ }
      render();
      (intent === 'grant' ? revoke.querySelector('button') : grant.querySelector('input'))?.focus();
    });
  }
  root.querySelector('[data-cleanup-exit]')?.addEventListener('click', () => {
    state = '';
    grant.reset();
    try { sessionStorage.removeItem(key); } catch { /* No stored state to clear. */ }
    render();
  });
  render();
}
