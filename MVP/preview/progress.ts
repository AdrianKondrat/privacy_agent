import { accountUseMessages, readAccountUseChange, sampleAccountUse, type AccountUseByBreach } from '../lib/account-use.ts';
import { planChoices, readPlanChoice, type PlanChoice } from '../lib/experiment.ts';
import { updateProgress, type Progress } from '../lib/findings.ts';
import { sampleFindings, sampleProgress } from '../lib/sample.ts';

const accountUseKey = 'koverr-preview-account-use';
const planKey = 'koverr-preview-plan';
const storageKey = 'koverr-preview-progress';

export function mountPreviewProgress() {
  const root = document.querySelector('[data-koverr-preview]');
  const count = root?.querySelector('[data-preview-count]');
  const error = root?.querySelector('[data-preview-error]');
  if (!root || !count || !error) return;

  const planForm = root.querySelector<HTMLFormElement>('[data-preview-plan]');
  const planResult = root.querySelector('[data-plan-result]');
  let accountUse: AccountUseByBreach = {};
  let choice: PlanChoice | undefined;
  let progress: Progress = {};
  try {
    accountUse = sampleAccountUse(sampleFindings, sessionStorage.getItem(accountUseKey) ?? undefined);
    choice = readPlanChoice(sessionStorage.getItem(planKey));
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
  const useForms = Array.from(root.querySelectorAll<HTMLFormElement>('[data-preview-use]'));
  const renderAccountUse = (form: HTMLFormElement) => {
    const choice = accountUse[form.dataset.previewUse ?? ''];
    const message = form.parentElement?.querySelector('[data-preview-use-result]');
    const tip = form.parentElement?.querySelector<HTMLElement>('[data-preview-close-tip]');
    if (message) message.textContent = choice ? accountUseMessages[choice] : '';
    if (tip) tip.hidden = choice !== 'close';
    for (const button of form.querySelectorAll('button')) button.setAttribute('aria-pressed', String(choice === button.value));
  };
  for (const form of useForms) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const change = readAccountUseChange(sampleFindings, new FormData(form, event.submitter));
      if (!change) return;
      accountUse = { ...accountUse, [change.id]: change.choice };
      try { sessionStorage.setItem(accountUseKey, JSON.stringify(accountUse)); } catch { /* Keep the answer on this page. */ }
      renderAccountUse(form);
    });
    for (const button of form.querySelectorAll('button')) button.disabled = false;
    renderAccountUse(form);
    if (accountUse[form.dataset.previewUse ?? '']) {
      const finding = form.closest<HTMLDetailsElement>('.check-finding > details');
      if (finding) finding.open = true;
    }
  }
  const renderPlan = () => {
    if (!planForm || !planResult) return;
    planForm.hidden = !!choice;
    planResult.textContent = choice ? 'Preference saved in this tab · ' + planChoices[choice].label : '';
  };
  planForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (choice) return;
    choice = readPlanChoice(new FormData(planForm, event.submitter).get('choice'));
    if (choice) {
      try { sessionStorage.setItem(planKey, choice); } catch { /* Keep the preference on this page. */ }
      renderPlan();
    }
  });
  for (const button of planForm?.querySelectorAll('button') ?? []) button.disabled = false;
  function reset() {
    choice = undefined;
    accountUse = {};
    progress = {};
    try {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(planKey);
      sessionStorage.removeItem(accountUseKey);
    } catch {
      // No stored progress to remove.
    }
    render();
    renderPlan();
    useForms.forEach(renderAccountUse);
  }
  root.querySelector('[data-preview-reset]')?.addEventListener('click', reset);
  render();
  renderPlan();
}
