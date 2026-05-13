import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import styles from './PrimaryButton.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className = '',
  ...rest
}: PrimaryButtonProps) {
  // Omit motion-conflicting props from HTML button attributes
  const { 
    onDrag, onDragStart, onDragEnd, onAnimationStart, 
    style, ...props 
  } = rest as any;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={loading || props.disabled}
      style={style}
      {...props}
    >
      {loading ? (
        <Loader2 className={styles.spinner} size={size === 'sm' ? 14 : 18} />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
