import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MainLayout.module.css';

export function MainLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.main}>
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={styles.header}
        >
          <div className={styles.headerGlass}>
            <div className={styles.headerTitle}>
              <span className={styles.breadcrumb}>SafeGuard OS / Monitoring</span>
              <h1>Safety Compliance Dashboard</h1>
            </div>
            
            <div className={styles.headerActions}>
              <div className={styles.search}>
                <input type="text" placeholder="Quick search..." />
              </div>
              <div className={styles.status}>
                <div className={styles.pulse} />
                <span>Live System</span>
              </div>
            </div>
          </div>
        </motion.header>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
