import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ id, title, subtitle, children, className = '' }: CardProps) {
  return (
    <div id={id} className={`${styles.card} ${className}`}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
