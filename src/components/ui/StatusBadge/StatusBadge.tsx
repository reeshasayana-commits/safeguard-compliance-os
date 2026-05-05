import { type ReactNode } from 'react';
import styles from './StatusBadge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<string, BadgeVariant> = {
  completed: 'success',
  mitigated: 'success',
  approved: 'success',
  resolved: 'success',
  closed: 'success',
  in_progress: 'warning',
  in_review: 'warning',
  assigned: 'info',
  scheduled: 'info',
  open: 'danger',
  failed: 'danger',
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
};

/** Resolve a status string to a badge variant automatically */
export function resolveVariant(status: string): BadgeVariant {
  return variantMap[status.toLowerCase().replace(/\s+/g, '_')] ?? 'neutral';
}

export function StatusBadge({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
}: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
