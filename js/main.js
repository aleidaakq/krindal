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
const linkedIn = httpsUrl(config.linkedInUrl);
if (linkedIn) {
  for (const group of document.querySelectorAll('[data-channels]')) {
    const link = document.createElement('a');
    link.href = linkedIn;
    link.textContent = 'LinkedIn';
    group.append(link);
    group.hidden = false;
  }
}