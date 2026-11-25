const form = document.querySelector('[data-contact]');
if (form) initialize(form);

function initialize(form) {
  const emailButton = form.querySelector('[value=email]');
  const whatsappButton = form.querySelector('[value=whatsapp]');
  const status = form.querySelector('[role=status]');
  const followUp = form.querySelector('[data-success-contact]');
  const endpoint = /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(form.dataset.endpoint) ? form.dataset.endpoint : '';
  const draft = JSON.parse(form.dataset.draft);
  const { elements } = form;
  const service = elements.namedItem('service');
  const phone = elements.namedItem('phone');
  const requested = new URL(location.href).searchParams.get('service');
  if ([...service.options].some(option => option.value === requested)) service.value = requested;

  const keys = ['name', 'company', 'email', 'phone', 'country', 'service', 'message'];
  const fields = [...keys, 'consent'].map(key => elements.namedItem(key));
  const show = index => { status.textContent = form.getAttribute('data-status-' + index); };
  let submitting = false;

  function syncButtons() {
    emailButton.disabled = submitting || !endpoint;
    whatsappButton.disabled = submitting;
  }

  form.noValidate = true;
  syncButtons();
  form.addEventListener('input', event => event.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const viaWhatsApp = event.submitter === whatsappButton;
    if (submitting || (!viaWhatsApp && !endpoint)) return;
    followUp.hidden = true;
    if (elements.namedItem('_gotcha').value) {
      show(3);
      return;
    }
    for (const key of keys) {
      const field = elements.namedItem(key);
      field.value = field.value.trim();
    }
    const international = phone.value.replace(/[\s().-]/g, '');
    const phoneValid = /^\+[1-9]\d{6,14}$/.test(international);
    const invalid = fields.filter(field => !field.validity.valid ||
      (field === phone && !phoneValid) ||
      (field.name === 'message' && field.value.length < 10));
    for (const field of fields) {
      if (invalid.includes(field)) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
    if (invalid.length) {
      show(invalid[0] === phone && !phoneValid ? 5 : 0);
      invalid[0].focus();
      return;
    }

    if (viaWhatsApp) {
      const values = keys.map(key => key === 'service' ? service.selectedOptions[0].text : elements.namedItem(key).value);
      const lines = values.slice(0, -1).map((value, i) => draft.labels[i] + ': ' + value);
      const message = [draft.heading, '', ...lines, '', draft.labels[6] + ':', values[6], '', draft.source].join('\n');
      window.open(draft.url + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
      show(6);
      return;
    }

    submitting = true;
    syncButtons();
    form.setAttribute('aria-busy', 'true');
    show(1);
    try {
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        credentials: 'omit',
        redirect: 'error',
        signal: AbortSignal.timeout(15000)
      });
      if (!result.ok || (await result.json()).ok !== true) throw new Error('Form submission not accepted');
      form.reset();
      show(2);
      followUp.hidden = false;
    } catch {
      show(3);
    } finally {
      submitting = false;
      syncButtons();
      form.removeAttribute('aria-busy');
    }
  });
}