import { ArrowUpRight, BarChart3, Check, Clipboard } from 'lucide-react';
import { useApp } from '../context/AppContext';

function AnalyticsSummary({ analytics }) {
  if (!analytics) return null;
  return <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#17231f] p-4 text-white"><p className="text-xs text-[#a9bbb0]">Total clicks</p><p className="mt-1 text-3xl font-bold">{analytics.clicks}</p></div><div className="rounded-xl border border-[#d8dfd7] bg-white p-4"><p className="text-xs text-[#718078]">Created</p><p className="mt-1 font-bold">{new Date(analytics.createdAt).toLocaleDateString()}</p></div><div className="rounded-xl border border-[#d8dfd7] bg-white p-4"><p className="text-xs text-[#718078]">Short key</p><p className="mt-1 font-bold">{analytics.shortKey}</p></div></div>;
}

function ResultCard() {
  const { analytics, copyLink, isCopied, loadAnalytics, result } = useApp();
  if (!result) return null;
  return <section className="animate-rise border-t border-[#d8dfd7] py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Your link is ready</p><h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Small URL. Big reach.</h2></div><div className="flex gap-2"><button onClick={copyLink} className="flex items-center gap-2 rounded-lg border border-[#cfd9cf] bg-white px-3.5 py-2.5 text-sm font-bold hover:bg-[#edf4ec]">{isCopied ? <Check size={16} /> : <Clipboard size={16} />} {isCopied ? 'Copied' : 'Copy'}</button><a href={result.shortUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-[#deff6e] px-3.5 py-2.5 text-sm font-bold hover:bg-[#cced5d]">Open <ArrowUpRight size={16} /></a></div></div><div className="mt-6 rounded-xl border border-[#d8dfd7] bg-white p-5"><a href={result.shortUrl} target="_blank" rel="noreferrer" className="break-all text-xl font-bold text-[#5b8b73] hover:underline">{result.shortUrl}</a><p className="mt-2 break-all text-sm text-[#718078]">{result.longUrl}</p></div><button onClick={loadAnalytics} className="mt-4 flex items-center gap-2 text-sm font-bold text-[#5b8b73] hover:text-[#17231f]"><BarChart3 size={16} /> View analytics</button><AnalyticsSummary analytics={analytics} /></section>;
}

export { AnalyticsSummary };
export default ResultCard;
