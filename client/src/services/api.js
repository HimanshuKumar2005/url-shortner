import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL || '';

function authConfig(auth) {
  return auth?.token ? { headers: { Authorization: `Bearer ${auth.token}` } } : undefined;
}

export function shortenUrl(longUrl, label, auth, website = '', lifecycle = {}) {
  return axios.post(`${API_ROOT}/api/shorten`, { longUrl, label, website, ...lifecycle }, authConfig(auth));
}

export function fetchSavedLinks(auth) {
  return axios.get(`${API_ROOT}/api/urls`, authConfig(auth));
}

export function updateLink(shortKey, updates, auth) {
  return axios.patch(`${API_ROOT}/api/urls/${shortKey}`, updates, authConfig(auth));
}

export function deleteLink(shortKey, auth) {
  return axios.delete(`${API_ROOT}/api/urls/${shortKey}`, authConfig(auth));
}

export function fetchAnalytics(shortKey) {
  return axios.get(`${API_ROOT}/api/analytics/${shortKey}`);
}

export function authenticate(mode, form) {
  const endpoint = mode === 'login' ? 'login' : 'register';
  const payload = mode === 'login'
    ? { email: form.email, password: form.password }
    : form;
  return axios.post(`${API_ROOT}/api/auth/${endpoint}`, payload);
}

export function authenticateWithGoogle(credential) {
  return axios.post(`${API_ROOT}/api/auth/google`, { credential });
}
