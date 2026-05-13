import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => ReactNode;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  id: string;
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  pagination?: PaginationConfig;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  isLoading,
}: DataTableProps<T>) {
  const gridTemplate = columns.map(c => c.width || '1fr').join(' ');

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} />
        <span>Syncing encrypted records...</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        {/* Header */}
        <div className={styles.headerRow} style={{ gridTemplateColumns: gridTemplate }}>
          {columns.map((col) => (
            <div 
              key={col.key} 
              className={`${styles.headerCell} ${col.align === 'right' ? styles.cellRight : ''} ${col.align === 'center' ? styles.cellCenter : ''}`}
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className={styles.rowList}>
          <AnimatePresence>
            {data.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.emptyState}
              >
                No records found matching your criteria.
              </motion.div>
            ) : (
              data.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 30 }}
                  className={styles.rowStrip}
                  style={{ gridTemplateColumns: gridTemplate }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <div 
                      key={col.key} 
                      className={`${styles.cell} ${col.align === 'right' ? styles.cellRight : ''} ${col.align === 'center' ? styles.cellCenter : ''}`}
                    >
                      {col.render(item)}
                    </div>
                  ))}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
