import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  authenticate,
  authenticateWithGoogle,
  fetchAnalytics,
  fetchSavedLinks,
  shortenUrl,
} from '../services/api';
import { clearAuth, readAuth, readSessionLinks, saveAuth, saveSessionLinks } from '../utils/storage';
import { isValidUrl } from '../utils/validation';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [longUrl, setLongUrl] = useState('');
  const [result, setResult] = useState(null);
  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(readAuth);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!auth) setLinks(readSessionLinks());
  }, [auth]);

  useEffect(() => {
    if (!auth) saveSessionLinks(links);
  }, [auth, links]);

  useEffect(() => {
    if (!auth?.token) return;
    fetchSavedLinks(auth)
      .then(({ data }) => setLinks(data))
      .catch(() => setError('Your saved links could not be loaded.'));
  }, [auth]);

  useEffect(() => {
    if (!isAuthOpen || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;

    function renderGoogleButton() {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
      });
    }

    if (window.google?.accounts?.id) renderGoogleButton();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = renderGoogleButton;
      document.head.appendChild(script);
    }
    return undefined;
  }, [isAuthOpen]);

  function completeAuth(data) {
    saveAuth(data);
    setAuth(data);
    setIsAuthOpen(false);
    setAuthForm({ name: '', email: '', password: '' });
  }

  async function handleGoogleCredential(response) {
    try {
      const { data } = await authenticateWithGoogle(response.credential);
      completeAuth(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Google sign-in failed.');
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setError('');
    setIsAuthLoading(true);
    try {
      const { data } = await authenticate(authMode, authForm);
      completeAuth(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Authentication failed.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setAuth(null);
    setLinks(readSessionLinks());
  }

  async function createShortLink(event) {
    event.preventDefault();
    setError('');
    setAnalytics(null);
    if (!isValidUrl(longUrl)) {
      setError('Enter a complete HTTP or HTTPS URL.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await shortenUrl(longUrl, auth);
      setResult(data);
      setLinks((currentLinks) => [data, ...currentLinks]);
      setLongUrl('');
    } catch {
      setError('The service could not shorten that link. Is the API running?');
    } finally {
      setIsLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(result.shortUrl);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  }

  async function loadLinkAnalytics(link) {
    try {
      setResult(link);
      const { data } = await fetchAnalytics(link.shortKey);
      setAnalytics(data);
    } catch {
      setError('Analytics are temporarily unavailable.');
    }
  }

  async function loadAnalytics() {
    if (result) await loadLinkAnalytics(result);
  }

  const value = {
    auth,
    authForm,
    authMode,
    analytics,
    copyLink,
    createShortLink,
    error,
    googleButtonRef,
    isAuthLoading,
    isAuthOpen,
    isCopied,
    isLoading,
    links,
    loadAnalytics,
    loadLinkAnalytics,
    longUrl,
    logout,
    result,
    setAuthForm,
    setAuthMode,
    setError,
    setIsAuthOpen,
    setLongUrl,
    submitAuth,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
