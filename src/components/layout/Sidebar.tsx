import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertCircle, 
  ClipboardList, 
  Settings, 
  ShieldAlert,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/risks', label: 'Risk Register', icon: <AlertCircle size={20} /> },
  { path: '/audits', label: 'Audits', icon: <ClipboardList size={20} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={styles.sidebar}
    >
      <div className={styles.top}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <ShieldAlert size={24} color="white" />
          </div>
          <span className={styles.logoText}>SafeGuard</span>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <span className={styles.iconWrapper}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                  <ChevronRight size={14} className={styles.chevron} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.bottom}>
        <button className={styles.userProfile}>
          <div className={styles.avatar}>RS</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Reesha S.</span>
            <span className={styles.userRole}>Lead Auditor</span>
          </div>
        </button>
        <button className={styles.logoutBtn} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </motion.aside>
  );
}
