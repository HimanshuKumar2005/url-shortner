import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL || '';

function authConfig(auth) {
  return auth?.token ? { headers: { Authorization: `Bearer ${auth.token}` } } : undefined;
}

export function shortenUrl(longUrl, auth) {
  return axios.post(`${API_ROOT}/api/shorten`, { longUrl }, authConfig(auth));
}

export function fetchSavedLinks(auth) {
  return axios.get(`${API_ROOT}/api/urls`, authConfig(auth));
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
