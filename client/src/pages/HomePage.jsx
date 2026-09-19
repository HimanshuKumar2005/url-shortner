import { Sparkles } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import ShortenForm from '../components/ShortenForm';

function HomePage() {
  return <><section className="grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24"><div className="animate-rise"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfd9cf] bg-white/70 px-3 py-1.5 text-xs font-bold tracking-[0.13em] text-[#638072] uppercase"><Sparkles size={14} /> link intelligence</div><h1 className="max-w-xl text-5xl leading-[0.98] font-black tracking-[-0.055em] sm:text-7xl">Make every link <span className="text-[#5b8b73]">count.</span></h1><p className="mt-7 max-w-lg text-lg leading-8 text-[#64716a]">A quieter, faster way to turn long URLs into memorable links. Built for teams that care where every click lands.</p></div><ShortenForm /></section><ResultCard /></>;
}

export default HomePage;
