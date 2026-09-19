import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import AuthModal from './AuthModal';

function AppLayout() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f2] text-[#17231f]">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-12">
        <Navigation />
        <Outlet />
      </div>
      <AuthModal />
      <footer className="border-t border-[#d8dfd7] px-5 py-6 text-center text-xs font-semibold tracking-[0.12em] text-[#8a9890] uppercase">fast by design / resilient by default</footer>
    </main>
  );
}

export default AppLayout;
