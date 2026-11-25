const preference = 'krindal.language';
const links = [...document.querySelectorAll('[data-lang]')];
const root = new URL('../../', import.meta.url);

try {
  for (const link of links) {
    link.addEventListener('click', () => {
      try { localStorage.setItem(preference, link.dataset.lang); } catch { /* optional storage */ }
    });
  }
  const preferred = localStorage.getItem(preference);
  const preferredLink = links.find(link => link.dataset.lang === preferred);
  if (location.href === root.href && preferredLink && preferred !== 'en') {
    location.replace(preferredLink.href);
  }
} catch { /* language links work when storage is unavailable */ }