import { Link } from 'react-router-dom';
import LinkLibrary from '../components/LinkLibrary';
import { AnalyticsSummary } from '../components/ResultCard';
import { useApp } from '../context/AppContext';

function DashboardPage() {
  const { analytics, links, loadLinkAnalytics, result } = useApp();
  return <section className="py-16 lg:py-24"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Analytics dashboard</p><h1 className="mt-1 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Your link library.</h1><p className="mt-4 max-w-lg text-lg leading-8 text-[#64716a]">Review every shortened URL and inspect the traffic it brings in.</p></div><Link to="/" className="w-fit rounded-lg bg-[#17231f] px-4 py-3 text-sm font-bold text-white">Create a link</Link></div>{links.length ? <><LinkLibrary links={links} onViewAnalytics={loadLinkAnalytics} />{result && analytics && <div className="border-t border-[#d8dfd7] py-10"><p className="text-xs font-bold tracking-[0.14em] text-[#718078] uppercase">Selected link</p><p className="mt-2 break-all text-lg font-bold text-[#5b8b73]">{result.shortUrl}</p><AnalyticsSummary analytics={analytics} /></div>}</> : <div className="rounded-2xl border border-dashed border-[#cfd9cf] bg-white p-10 text-center"><h2 className="text-2xl font-bold">No links yet</h2><p className="mt-2 text-[#64716a]">Create your first short link to see it here.</p><Link to="/" className="mt-5 inline-flex rounded-lg bg-[#deff6e] px-4 py-3 text-sm font-bold">Shorten a URL</Link></div>}</section>;
}

export default DashboardPage;
