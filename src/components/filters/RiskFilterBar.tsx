import { Search, Download, FileText, X, RotateCcw } from 'lucide-react';
import { useRiskStore, useFilteredRisks } from '../../store/useRiskStore';
import { RiskStatus, RiskSeverity } from '../../types';
import { exportRisksToCSV, exportRisksToPDF } from '../../utils/export';
import styles from './RiskFilterBar.module.css';

const STATUS_OPTIONS = [
  { value: RiskStatus.OPEN, label: 'Open' },
  { value: RiskStatus.ASSIGNED, label: 'Assigned' },
  { value: RiskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: RiskStatus.IN_REVIEW, label: 'In Review' },
  { value: RiskStatus.RESOLVED, label: 'Resolved' },
  { value: RiskStatus.APPROVED, label: 'Approved' },
  { value: RiskStatus.MITIGATED, label: 'Mitigated' },
  { value: RiskStatus.CLOSED, label: 'Closed' },
];

const SEVERITY_OPTIONS = [
  { value: RiskSeverity.CRITICAL, label: 'Critical' },
  { value: RiskSeverity.HIGH, label: 'High' },
  { value: RiskSeverity.MEDIUM, label: 'Medium' },
  { value: RiskSeverity.LOW, label: 'Low' },
];

export function RiskFilterBar() {
  const { filters, setFilters, resetFilters } = useRiskStore();
  const filteredRisks = useFilteredRisks();

  const hasActiveFilters = !!(
    filters.search || filters.status || filters.severity ||
    filters.locationId || filters.dateFrom || filters.dateTo
  );

  return (
    <div className={styles.bar}>
      {/* ── Row 1: Search + Exports ──────────────── */}
      <div className={styles.row}>
        <div className={styles.searchGroup}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search risks by title, ID, or description..."
              className={styles.searchInput}
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              aria-label="Search risks"
            />
            {filters.search && (
              <button
                className={styles.clearBtn}
                onClick={() => setFilters({ search: '' })}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className={styles.resultCount}>
            {filteredRisks.length} result{filteredRisks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={styles.exportGroup}>
          <button
            className={styles.exportBtn}
            onClick={() => exportRisksToCSV(filteredRisks)}
            title="Export filtered risks as CSV"
          >
            <Download size={15} />
            <span>CSV</span>
          </button>
          <button
            className={styles.exportBtn}
            onClick={() => exportRisksToPDF(filteredRisks)}
            title="Export filtered risks as PDF"
          >
            <FileText size={15} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Filter controls ───────────────── */}
      <div className={styles.row}>
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value as RiskStatus | '' })}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filters.severity}
            onChange={(e) => setFilters({ severity: e.target.value as RiskSeverity | '' })}
            aria-label="Filter by severity"
          >
            <option value="">All Severities</option>
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className={styles.dateRange}>
            <label className={styles.dateLabel}>From</label>
            <input
              type="date"
              className={styles.dateInput}
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
              aria-label="Filter from date"
            />
            <label className={styles.dateLabel}>To</label>
            <input
              type="date"
              className={styles.dateInput}
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
              aria-label="Filter to date"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
