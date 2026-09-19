import { useApp } from '../context/AppContext';

function AuthModal() {
  const {
    authForm,
    authMode,
    error,
    googleButtonRef,
    isAuthLoading,
    isAuthOpen,
    setAuthForm,
    setAuthMode,
    setIsAuthOpen,
    submitAuth,
  } = useApp();

  if (!isAuthOpen) return null;

  return (
    <div className="fixed inset-0 z-10 grid place-items-center bg-[#17231f]/35 px-5">
      <div className="w-full max-w-md rounded-2xl border border-[#d8dfd7] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Your link library</p><h2 className="mt-1 text-2xl font-bold">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2></div>
          <button onClick={() => setIsAuthOpen(false)} className="text-xl text-[#718078]" aria-label="Close">&times;</button>
        </div>
        <form onSubmit={submitAuth} className="mt-6 space-y-3">
          {authMode === 'register' && <input required value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Your name" className="w-full rounded-xl border border-[#d8dfd7] px-4 py-3 text-sm" />}
          <input required type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="Email address" className="w-full rounded-xl border border-[#d8dfd7] px-4 py-3 text-sm" />
          <input required minLength="8" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="Password (8+ characters)" className="w-full rounded-xl border border-[#d8dfd7] px-4 py-3 text-sm" />
          {error && <p className="text-sm font-medium text-[#bb5d4c]">{error}</p>}
          <button disabled={isAuthLoading} className="w-full rounded-xl bg-[#17231f] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{isAuthLoading ? 'Please wait...' : authMode === 'login' ? 'Log in' : 'Register'}</button>
        </form>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID && <><div className="my-4 flex items-center gap-3 text-xs text-[#718078]"><span className="h-px flex-1 bg-[#d8dfd7]" /> or <span className="h-px flex-1 bg-[#d8dfd7]" /></div><div ref={googleButtonRef} className="flex justify-center" /></>}
        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="mt-5 w-full text-sm font-bold text-[#5b8b73]">{authMode === 'login' ? 'Need an account? Register' : 'Already registered? Log in'}</button>
      </div>
    </div>
  );
}

export default AuthModal;
