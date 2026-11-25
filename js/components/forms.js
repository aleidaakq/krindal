import { config } from '../config.js';
import { httpsUrl } from './utils.js';

const form = document.querySelector('[data-contact]');
if (form) initialize(form);

function initialize(form) {
  const button = form.querySelector('button[type=submit]');
  const status = form.querySelector('[role=status]');
  const endpoint = httpsUrl(config.formEndpoint);
  const service = form.elements.namedItem('service');
  const requested = new URL(location.href).searchParams.get('service');
  if ([...service.options].some(option => option.value === requested)) service.value = requested;

  const fields = [...form.elements].filter(field => field.willValidate && field !== button);
  const show = index => { status.textContent = form.dataset['status' + index]; };
  let submitting = false;

  form.addEventListener('input', event => event.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!endpoint || submitting) return;
    for (const key of ['name', 'company', 'email', 'phone', 'message']) {
      const field = form.elements.namedItem(key);
      field.value = field.value.trim();
    }
    const invalid = fields.filter(field => !field.validity.valid ||
      (field.name === 'message' && field.value.length < 10));
    for (const field of fields) {
      if (invalid.includes(field)) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
    if (invalid.length) {
      show(0);
      invalid[0].focus();
      return;
    }

    submitting = true;
    button.disabled = true;
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
      if (!result.ok) throw new Error('Request failed');
      form.reset();
      show(2);
    } catch {
      show(3);
    } finally {
      submitting = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });

  if (endpoint) {
    form.noValidate = true;
    button.disabled = false;
    status.textContent = '';
  }
}