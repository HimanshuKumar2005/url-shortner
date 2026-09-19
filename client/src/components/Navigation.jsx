import { Link, NavLink } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

function Navigation() {
  const { auth, logout, setError, setIsAuthOpen } = useApp();

  return (
    <nav className="flex items-center justify-between border-b border-[#d8dfd7] pb-5">
      <Link to="/" className="flex items-center gap-2 text-sm font-bold tracking-[0.18em] uppercase">
        <span className="grid size-8 place-items-center rounded-lg bg-[#deff6e] text-[#17231f]"><Link2 size={17} /></span>
        shortner
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#718078] uppercase sm:flex"><span className="size-2 rounded-full bg-[#65b891]" /> system operational</span>
        <NavLink to="/dashboard" className="hidden rounded-lg border border-[#cfd9cf] bg-white px-3 py-2 text-xs font-bold sm:block">Dashboard</NavLink>
        {auth ? <button onClick={logout} className="rounded-lg border border-[#cfd9cf] bg-white px-3 py-2 text-xs font-bold">{auth.user.name || auth.user.email} / Sign out</button> : <button onClick={() => { setError(''); setIsAuthOpen(true); }} className="rounded-lg bg-[#17231f] px-3 py-2 text-xs font-bold text-white">Log in / Register</button>}
      </div>
    </nav>
  );
}

export default Navigation;
