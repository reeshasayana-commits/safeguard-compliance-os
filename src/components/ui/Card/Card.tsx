import { type ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export function Card({
  children,
  title,
  subtitle,
  action,
  padding = 'lg',
  className = '',
  id,
}: CardProps) {
  return (
    <div id={id} className={`${styles.card} ${styles[`pad-${padding}`]} ${className}`}>
      {(title || action) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
