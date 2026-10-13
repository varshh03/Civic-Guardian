import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';

export const Layout = () => (
  <div className="min-h-screen bg-slate-blue-50 flex flex-col">
    <Header />
    <div className="flex flex-1 max-w-content mx-auto w-full px-4 py-4 gap-6">
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <Sidebar />
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
    <div className="lg:hidden">
      <BottomNav />
    </div>
  </div>
);
