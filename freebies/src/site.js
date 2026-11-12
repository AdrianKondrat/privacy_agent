// One place to set what every PDF prints for the launch-list link and the check date.
// Change these, then run: bash freebies/build.sh
window.KOVERR = {
  url: 'koverr.com',           // public launch-list address, without https://
  checked: '12 November 2026', // the date the links and rules were last checked
  recheck: 'February 2027',    // when the guides should be checked again
};
document.addEventListener('DOMContentLoaded', () => {
  for (const el of document.querySelectorAll('[data-k]')) el.textContent = window.KOVERR[el.dataset.k];
});
