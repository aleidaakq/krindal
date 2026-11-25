import './components/scroll.js';
import './components/menu.js';
import './components/i18n.js';
import './components/forms.js';
import { config } from './config.js';
import { httpsUrl } from './components/utils.js';

for (const year of document.querySelectorAll('[data-year]')) {
  year.textContent = new Date().getFullYear();
}
const booking = httpsUrl(config.bookingUrl);
if (booking) {
  for (const link of document.querySelectorAll('[data-booking]')) link.href = booking;
}
const email = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(config.email) ? 'mailto:' + config.email : '';
const channels = [
  [config.email, email],
  ['WhatsApp', httpsUrl(config.whatsappUrl)],
  ['LinkedIn', httpsUrl(config.linkedInUrl)]
];
for (const group of document.querySelectorAll('[data-channels]')) {
  for (const [label, href] of channels) {
    if (!href) continue;
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    group.append(link);
  }
  group.hidden = !group.childElementCount;
}