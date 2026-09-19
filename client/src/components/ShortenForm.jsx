import { ArrowUpRight, Link2, LoaderCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function ShortenForm() {
  const { error, isLoading, longUrl, setLongUrl, createShortLink } = useApp();

  return (
    <div className="animate-rise-delayed rounded-2xl border border-[#d8dfd7] bg-white p-5 shadow-[0_22px_60px_rgba(36,62,48,0.08)] sm:p-7">
      <div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Create a link</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">Where should it go?</h2></div><div className="grid size-10 place-items-center rounded-xl bg-[#edf4ec] text-[#5b8b73]"><ArrowUpRight size={19} /></div></div>
      <form onSubmit={createShortLink}>
        <label htmlFor="long-url" className="mb-2 block text-sm font-semibold">Destination URL</label>
        <input id="long-url" value={longUrl} onChange={(event) => setLongUrl(event.target.value)} placeholder="https://your-site.com/something-long" className="w-full rounded-xl border border-[#d8dfd7] bg-[#fbfcfa] px-4 py-3.5 text-sm outline-none transition focus:border-[#5b8b73] focus:ring-4 focus:ring-[#5b8b73]/10" />
        {error && <p className="mt-2 text-sm font-medium text-[#bb5d4c]">{error}</p>}
        <button disabled={isLoading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17231f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#30483c] disabled:cursor-wait disabled:opacity-70">{isLoading ? <LoaderCircle className="animate-spin" size={17} /> : <Link2 size={17} />} {isLoading ? 'Creating your link...' : 'Shorten URL'}</button>
      </form>
    </div>
  );
}

export default ShortenForm;
