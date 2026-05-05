import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DataTable.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: PaginationConfig;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  id?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<T>({
  columns,
  data,
  pagination,
  emptyMessage = 'No data found',
  emptyIcon,
  loading = false,
  onRowClick,
  rowKey,
  id,
}: DataTableProps<T>) {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  const renderPageNumbers = () => {
    if (!pagination) return null;
    const pages: number[] = [];
    const current = pagination.page;

    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pages.push(i);
    }

    return pages.map((p) => (
      <button
        key={p}
        className={`${styles.pageBtn} ${p === current ? styles.pageBtnActive : ''}`}
        onClick={() => pagination.onPageChange(p)}
        aria-label={`Page ${p}`}
        aria-current={p === current ? 'page' : undefined}
      >
        {p}
      </button>
    ));
  };

  return (
    <div id={id} className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table} role="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={styles.th}
                  style={{ width: col.width, textAlign: col.align ?? 'left' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.loadingBar}>
                    <div className={styles.loadingBarInner} />
                  </div>
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    {emptyIcon && <div className={styles.emptyIcon}>{emptyIcon}</div>}
                    <p className={styles.emptyText}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={styles.td}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────── */}
      {pagination && totalPages > 1 && (
        <div className={styles.pagination} role="navigation" aria-label="Pagination">
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {totalPages}
            <span className={styles.paginationTotal}>
              {' '}· {pagination.total} results
            </span>
          </span>

          <div className={styles.pageControls}>
            <button
              className={styles.pageNav}
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {renderPageNumbers()}

            <button
              className={styles.pageNav}
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
