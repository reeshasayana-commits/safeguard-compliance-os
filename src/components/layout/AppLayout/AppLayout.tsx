import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Sidebar } from '../Sidebar';
import { useRiskStore } from '../../../store/useRiskStore';
import styles from './AppLayout.module.css';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/audits': 'Audits',
  '/risks': 'Risk Register',
  '/settings': 'Settings',
};

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';
  const [globalSearch, setGlobalSearch] = useState('');
  const setFilters = useRiskStore((s) => s.setFilters);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      // Navigate to Risk Register and apply search
      setFilters({ search: globalSearch.trim() });
      navigate('/risks');
      toast.success(`Searching risks for "${globalSearch.trim()}"`, { icon: '🔍' });
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        {/* ── Top Bar ──────────────────────────────── */}
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{title}</h1>

          <div className={styles.topbarActions}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search risks… (Enter)"
                className={styles.searchInput}
                aria-label="Global search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
              />
            </div>

            <button
              className={styles.notifBtn}
              aria-label="Notifications"
              onClick={() => toast('You have 0 new notifications', { icon: '🔔' })}
            >
              <Bell size={18} />
              <span className={styles.notifDot} />
            </button>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────── */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* ── Global Toast Container ──────────────────── */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
