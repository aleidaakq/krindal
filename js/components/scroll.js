const header = document.querySelector('#header');
if (header) {
  const update = () => header.classList.toggle('scrolled', window.scrollY > 50);
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('pageshow', update);
}