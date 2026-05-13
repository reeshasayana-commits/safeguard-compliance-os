import type { ReactNode } from 'react';
import styles from './StatusBadge.module.css';

export type StatusVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: StatusVariant;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ children, variant = 'neutral', dot, className = '' }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

export function resolveVariant(status: string): StatusVariant {
  const s = status.toUpperCase();
  if (s === 'OPEN' || s === 'ASSIGNED') return 'danger';
  if (s === 'IN_PROGRESS' || s === 'IN_REVIEW') return 'warning';
  if (s === 'RESOLVED' || s === 'MITIGATED') return 'info';
  if (s === 'APPROVED' || s === 'CLOSED') return 'success';
  return 'neutral';
}
