import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBrowserProfilePath } from '../scripts/check-browser-profiles.mjs';

test('detecta directorios de navegador y datos habituales aunque se aniden', () => {
  for (const path of [
    '.edge-headless/Default/History',
    'fixtures/browser-profile/Preferences',
    'backup/User Data/Local State',
    'copies/Profile 2/Network/Cookies-journal',
    'copies/Default/Login Data For Account',
  ]) assert.equal(isBrowserProfilePath(path), true, path);
});

test('conserva los archivos normales del simulador y sus pruebas', () => {
  for (const path of [
    'index.html', 'tests/browser-profiles.test.mjs', 'docs/browser-profile.md',
    'public/Network/Cookies.pdf', 'app/Default/calendar.json',
  ]) assert.equal(isBrowserProfilePath(path), false, path);
});
