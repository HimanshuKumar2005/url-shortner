import { useState } from 'react';
import axios from 'axios';
import { ArrowUpRight, BarChart3, Check, Clipboard, Link2, LoaderCircle, Sparkles } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || '';

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [result, setResult] = useState(null);
  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setAnalytics(null);
    if (!isValidUrl(longUrl)) {
      setError('Enter a complete HTTP or HTTPS URL.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_ROOT}/api/shorten`, { longUrl });
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

  async function loadAnalytics() {
    if (!result) return;
    try {
      const { data } = await axios.get(`${API_ROOT}/api/analytics/${result.shortKey}`);
      setAnalytics(data);
    } catch {
      setError('Analytics are temporarily unavailable.');
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f2] text-[#17231f]">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-[#d8dfd7] pb-5">
          <a href="/" className="flex items-center gap-2 text-sm font-bold tracking-[0.18em] uppercase">
            <span className="grid size-8 place-items-center rounded-lg bg-[#deff6e] text-[#17231f]"><Link2 size={17} /></span>
            shortner
          </a>
          <span className="hidden items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#718078] uppercase sm:flex"><span className="size-2 rounded-full bg-[#65b891]" /> system operational</span>
        </nav>

        <section className="grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfd9cf] bg-white/70 px-3 py-1.5 text-xs font-bold tracking-[0.13em] text-[#638072] uppercase"><Sparkles size={14} /> link intelligence</div>
            <h1 className="max-w-xl text-5xl leading-[0.98] font-black tracking-[-0.055em] sm:text-7xl">Make every link <span className="text-[#5b8b73]">count.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#64716a]">A quieter, faster way to turn long URLs into memorable links. Built for teams that care where every click lands.</p>
          </div>

          <div className="animate-rise-delayed rounded-2xl border border-[#d8dfd7] bg-white p-5 shadow-[0_22px_60px_rgba(36,62,48,0.08)] sm:p-7">
            <div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Create a link</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">Where should it go?</h2></div><div className="grid size-10 place-items-center rounded-xl bg-[#edf4ec] text-[#5b8b73]"><ArrowUpRight size={19} /></div></div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="long-url" className="mb-2 block text-sm font-semibold">Destination URL</label>
              <input id="long-url" value={longUrl} onChange={(event) => setLongUrl(event.target.value)} placeholder="https://your-site.com/something-long" className="w-full rounded-xl border border-[#d8dfd7] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none transition focus:border-[#5b8b73] focus:ring-4 focus:ring-[#5b8b73]/10" />
              {error && <p className="mt-2 text-sm font-medium text-[#bb5d4c]">{error}</p>}
              <button disabled={isLoading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17231f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#30483c] disabled:cursor-wait disabled:opacity-70">{isLoading ? <LoaderCircle className="animate-spin" size={17} /> : <Link2 size={17} />} {isLoading ? 'Creating your link...' : 'Shorten URL'}</button>
            </form>
          </div>
        </section>

        {result && <section className="animate-rise border-t border-[#d8dfd7] py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Your link is ready</p><h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Small URL. Big reach.</h2></div><div className="flex gap-2"><button onClick={copyLink} className="flex items-center gap-2 rounded-lg border border-[#cfd9cf] bg-white px-3.5 py-2.5 text-sm font-bold hover:bg-[#edf4ec]">{isCopied ? <Check size={16} /> : <Clipboard size={16} />} {isCopied ? 'Copied' : 'Copy'}</button><a href={result.shortUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-[#deff6e] px-3.5 py-2.5 text-sm font-bold hover:bg-[#cced5d]">Open <ArrowUpRight size={16} /></a></div></div><div className="mt-6 rounded-xl border border-[#d8dfd7] bg-white p-5"><a href={result.shortUrl} target="_blank" rel="noreferrer" className="break-all text-xl font-bold text-[#5b8b73] hover:underline">{result.shortUrl}</a><p className="mt-2 break-all text-sm text-[#718078]">{result.longUrl}</p></div><button onClick={loadAnalytics} className="mt-4 flex items-center gap-2 text-sm font-bold text-[#5b8b73] hover:text-[#17231f]"><BarChart3 size={16} /> View analytics</button>{analytics && <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#17231f] p-4 text-white"><p className="text-xs text-[#a9bbb0]">Total clicks</p><p className="mt-1 text-3xl font-bold">{analytics.clicks}</p></div><div className="rounded-xl border border-[#d8dfd7] bg-white p-4"><p className="text-xs text-[#718078]">Created</p><p className="mt-1 font-bold">{new Date(analytics.createdAt).toLocaleDateString()}</p></div><div className="rounded-xl border border-[#d8dfd7] bg-white p-4"><p className="text-xs text-[#718078]">Short key</p><p className="mt-1 font-bold">{analytics.shortKey}</p></div></div>}</section>}

        {links.length > 0 && <section className="border-t border-[#d8dfd7] py-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Analytics dashboard</p><h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Your link library</h2></div><span className="text-sm font-semibold text-[#718078]">{links.length} generated</span></div><div className="overflow-x-auto rounded-xl border border-[#d8dfd7] bg-white"><table className="w-full min-w-170 text-left text-sm"><thead className="border-b border-[#d8dfd7] bg-[#fbfcfa] text-xs tracking-widest text-[#718078] uppercase"><tr><th className="px-5 py-4">Short link</th><th className="px-5 py-4">Destination</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Clicks</th></tr></thead><tbody>{links.map((link) => <tr key={link.shortKey} className="border-b border-[#edf0eb] last:border-0"><td className="px-5 py-4 font-bold text-[#5b8b73]"><a href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortKey}</a></td><td className="max-w-67.5 truncate px-5 py-4 text-[#64716a]">{link.longUrl}</td><td className="whitespace-nowrap px-5 py-4 text-[#64716a]">{new Date(link.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 font-bold">{link.clicks}</td></tr>)}</tbody></table></div></section>}
      </div>
      <footer className="border-t border-[#d8dfd7] px-5 py-6 text-center text-xs font-semibold tracking-[0.12em] text-[#8a9890] uppercase">fast by design / resilient by default</footer>
    </main>
  );
}

export default App;
