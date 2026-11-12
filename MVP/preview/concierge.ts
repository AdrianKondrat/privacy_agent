import { permissionIntent } from '../lib/draft-permission.ts';

const key = 'koverr-cleanup-preview-permission';
const draftKey = 'koverr-cleanup-preview-draft';

export function mountConciergePreview() {
  const root = document.querySelector('[data-concierge-preview]');
  const grant = root?.querySelector<HTMLFormElement>('[data-permission-grant]');
  const revoke = root?.querySelector<HTMLFormElement>('[data-permission-revoke]');
  const status = root?.querySelector('[data-permission-status]');
  if (!root || !grant || !revoke || !status) return;
  const queue = root.querySelector<HTMLButtonElement>('[data-sample-queue]');
  const review = root.querySelector<HTMLButtonElement>('[data-sample-review]');
  const draftStatus = root.querySelector('[data-sample-draft-status]');
  const draftMessage = root.querySelector<HTMLElement>('[data-sample-draft-message]');
  let state = '';
  let draft = '';
  try {
    state = sessionStorage.getItem(key) ?? '';
    draft = sessionStorage.getItem(draftKey) ?? '';
  } catch {
    // Use page state when storage is unavailable.
  }

  const persistDraft = () => {
    try { sessionStorage.setItem(draftKey, draft); } catch { /* Keep sample progress on this page. */ }
  };
  const render = () => {
    grant.hidden = state === 'active';
    revoke.hidden = state !== 'active';
    if (queue && review && draftStatus && draftMessage) {
      queue.hidden = state !== 'active' || draft === 'pending' || draft === 'ready';
      review.hidden = state !== 'active' || draft !== 'pending';
      draftMessage.hidden = state !== 'active' || draft !== 'ready';
      draftStatus.textContent = state !== 'active'
        ? (draft === 'cancelled' ? 'Sample draft cancelled when permission was withdrawn.' : 'Enable sample permission to queue a draft.')
        : draft === 'ready' ? 'Sample draft ready to copy.' : draft === 'pending' ? 'Sample draft awaiting founder review.' : 'Fieldnote is marked Close in this example.';
    }
    status.textContent = state === 'active' ? 'Sample permission active' : state === 'revoked' ? 'Sample permission withdrawn' : 'Permission is off';
  };

  for (const form of [grant, revoke]) {
    for (const control of form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button')) control.disabled = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const intent = permissionIntent(new FormData(form, event.submitter));
      if (!intent) return;
      state = intent === 'grant' ? 'active' : 'revoked';
      if (intent === 'revoke' && (draft === 'pending' || draft === 'ready')) {
        draft = 'cancelled';
        persistDraft();
      }
      grant.reset();
      try { sessionStorage.setItem(key, state); } catch { /* Keep the choice on this page. */ }
      render();
      (intent === 'grant' ? revoke.querySelector('button') : grant.querySelector('input'))?.focus();
    });
  }
  if (queue && review) {
    queue.disabled = false;
    review.disabled = false;
    queue.addEventListener('click', () => {
      if (state !== 'active' || draft === 'pending' || draft === 'ready') return;
      draft = 'pending';
      persistDraft();
      render();
      review.focus();
    });
    review.addEventListener('click', () => {
      if (state !== 'active' || draft !== 'pending') return;
      draft = 'ready';
      persistDraft();
      render();
      draftStatus?.setAttribute('tabindex', '-1');
      if (draftStatus instanceof HTMLElement) draftStatus.focus();
    });
  }
  root.querySelector('[data-cleanup-exit]')?.addEventListener('click', () => {
    state = '';
    draft = '';
    grant.reset();
    try { sessionStorage.removeItem(key); sessionStorage.removeItem(draftKey); } catch { /* No stored state to clear. */ }
    render();
  });
  render();
}
