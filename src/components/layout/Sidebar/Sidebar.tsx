import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuthStore, getAvatarInitials } from '../../../store/useAuthStore';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/audits',   label: 'Audits',    icon: ClipboardCheck },
  { to: '/risks',    label: 'Risks',     icon: AlertTriangle },
  { to: '/settings', label: 'Settings',  icon: Settings },
] as const;

export function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      {/* ── Brand ──────────────────────────────────── */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <Shield size={22} strokeWidth={2.2} />
        </div>
        <span className={styles.logoText}>SafeGuard</span>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer / User ──────────────────────────── */}
      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>{getAvatarInitials(user.fullName)}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.fullName}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
