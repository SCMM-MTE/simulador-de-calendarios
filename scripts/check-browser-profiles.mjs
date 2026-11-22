import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const profileDirectories = new Set([
  '.edge-headless', '.chrome-profile', '.chromium-profile',
  '.playwright-profile', 'browser-profile', 'browser-profiles', 'user data',
]);

export function isBrowserProfilePath(path) {
  const parts = path.toLowerCase().split('/');
  const directories = parts.slice(0, -1);
  if (directories.some(part => profileDirectories.has(part))) return true;
  const file = parts.at(-1);
  const parent = directories.at(-1);
  const profile = part => /^(?:default|profile \d+)$/u.test(part ?? '');
  return (profile(parent) && file.startsWith('login data')) ||
    (parent === 'network' && profile(directories.at(-2)) && file.startsWith('cookies'));
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const tracked = readFileSync(0, 'utf8');
  const found = new Set(tracked.split('\0').filter(isBrowserProfilePath));
  if (found.size) {
    console.error(`Se han detectado ${found.size} archivos de perfiles de navegador en el índice de Git.`);
    console.error('Retira los archivos del índice conservando su copia local.');
    process.exitCode = 1;
  }
}
