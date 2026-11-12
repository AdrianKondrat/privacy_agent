import { updateProgress, type Progress } from '../lib/findings.ts';
import { sampleFindings, sampleProgress } from '../lib/sample.ts';

const storageKey = 'koverr-preview-progress';

export function mountPreviewProgress() {
  const root = document.querySelector('[data-koverr-preview]');
  const count = root?.querySelector('[data-preview-count]');
  const error = root?.querySelector('[data-preview-error]');
  if (!root || !count || !error) return;

  let progress: Progress = {};
  try {
    progress = sampleProgress(sessionStorage.getItem(storageKey) ?? undefined);
  } catch {
    // Keep sample progress in memory when storage is unavailable.
  }

  const forms = Array.from(root.querySelectorAll<HTMLFormElement>('[data-preview-step]'));
  const render = () => {
    let completed = 0;
    for (const form of forms) {
      const outcome = progress[form.dataset.previewStep ?? ''];
      const message = form.closest('.check-step')?.querySelector('[data-preview-outcome]');
      const done = form.querySelector<HTMLButtonElement>('[value="done"]');
      const undo = form.querySelector<HTMLButtonElement>('[value="undo"]');
      const skip = form.querySelector<HTMLDetailsElement>('.check-skip');
      if (!message || !done || !undo || !skip) continue;
      const finished = outcome?.status === 'done';
      if (finished) completed++;
      message.textContent = !outcome ? '' : finished ? 'Marked done by you' : 'Skipped · ' + outcome.reason;
      message.classList.toggle('check-done', finished);
      done.hidden = Boolean(outcome);
      undo.hidden = !outcome;
      skip.hidden = Boolean(outcome);
      if (outcome) skip.open = false;
    }
    count.textContent = completed + (completed === 1 ? ' step done' : ' steps done');
    count.classList.toggle('check-done', completed > 0);
  };

  for (const form of forms) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(form, event.submitter);
      const next = updateProgress(sampleFindings, progress, fields, new Date().toISOString());
      if (!next) {
        error.textContent = 'Add a short reason to skip this step.';
        form.querySelector<HTMLInputElement>('input[name="reason"]')?.focus();
        return;
      }
      error.textContent = '';
      progress = next;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(progress));
      } catch {
        // The current page can still record progress.
      }
      render();
      const key = form.dataset.previewStep ?? '';
      form.querySelector<HTMLButtonElement>(next[key] ? '[value="undo"]' : '[value="done"]')?.focus();
    });
    for (const button of form.querySelectorAll('button')) button.disabled = false;
  }
  function reset() {
    progress = {};
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // No stored progress to remove.
    }
    render();
  }
  root.querySelector('[data-preview-reset]')?.addEventListener('click', reset);
  render();
}
