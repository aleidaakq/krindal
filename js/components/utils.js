export function httpsUrl(input) {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}