const LINKS_STORAGE_KEY = 'shortner:links';
const AUTH_STORAGE_KEY = 'shortner:auth';

function readJson(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function readSessionLinks() {
  return readJson(sessionStorage, LINKS_STORAGE_KEY, []);
}

export function saveSessionLinks(links) {
  sessionStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
}

export function readAuth() {
  return readJson(localStorage, AUTH_STORAGE_KEY, null);
}

export function saveAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
