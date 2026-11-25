const toggle = document.querySelector('.menu-toggle');
const panel = document.querySelector('#site-nav');
const desktop = matchMedia('(min-width: 78rem)');

function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  panel.hidden = !open && !desktop.matches;
}

function updateLayout() {
  toggle.hidden = desktop.matches;
  setOpen(false);
}

if (toggle && panel) {
  updateLayout();
  desktop.addEventListener('change', updateLayout);
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  panel.addEventListener('click', event => {
    if (event.target.closest('a') && !desktop.matches) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktop.matches && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}