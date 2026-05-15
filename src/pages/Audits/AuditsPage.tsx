import { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, Plus, Download } from 'lucide-react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge, resolveVariant } from '../../components/ui/StatusBadge';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuditStore } from '../../store/useAuditStore';
import { CreateAuditSlideOver } from '../../components/slideover';
import { AuditDetailModal } from '../../components/modal';
import type { Audit } from '../../types';
import { exportAuditsToCSV, exportAuditsToPDF } from '../../utils/export';
import styles from './AuditsPage.module.css';

export function AuditsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 8;
  
  const { audits, fetchAudits, openSlideOver, selectAudit } = useAuditStore();

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const columns: Column<Audit>[] = useMemo(() => [
    {
      key: 'auditId',
      header: 'Audit ID',
      width: '140px',
      render: (row) => <span className={styles.monospace}>{row.auditId}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => row.location.name,
    },
    {
      key: 'auditor',
      header: 'Auditor',
      render: (row) => row.auditor.fullName,
    },
    {
      key: 'scheduledDate',
      header: 'Date',
      width: '120px',
      render: (row) => new Date(row.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (row) => {
        const label = row.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return <StatusBadge variant={resolveVariant(row.status)} dot>{label}</StatusBadge>;
      },
    },
    {
      key: 'score',
      header: 'Score',
      width: '80px',
      align: 'center',
      render: (row) => (row.score !== null ? `${row.score}%` : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      align: 'center',
      render: (row) => (
        <div className={styles.actions}>
          <button 
            className={styles.iconBtn} 
            aria-label="View audit"
            onClick={(e) => { e.stopPropagation(); selectAudit(row); }}
          >
            <Eye size={16} />
          </button>
          <button 
            className={styles.iconBtn} 
            aria-label="Edit audit"
            onClick={(e) => { e.stopPropagation(); selectAudit(row); }}
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ], [selectAudit]);

  // ── Filtered Audits — search + status filter ────────────────────────
  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const searchable = `${audit.auditId} ${audit.location.name} ${audit.auditor.fullName}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (statusFilter && audit.status !== statusFilter) return false;
      return true;
    });
  }, [searchTerm, statusFilter, audits]);

  const handleExport = () => {
    exportAuditsToCSV(filteredAudits);
  };

  // ── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAudits.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedAudits = filteredAudits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search audits..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div className={styles.headerActions}>
          <PrimaryButton variant="secondary" icon={<Download size={16} />} onClick={() => exportAuditsToCSV(filteredAudits)}>CSV</PrimaryButton>
          <PrimaryButton variant="secondary" icon={<Download size={16} />} onClick={() => exportAuditsToPDF(filteredAudits)}>PDF</PrimaryButton>
          <PrimaryButton icon={<Plus size={16} />} onClick={() => { selectAudit(null); openSlideOver(); }}>Add Audit</PrimaryButton>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div className={styles.tableWrapper}>
        <DataTable<Audit>
          id="audits-table"
          columns={columns}
          data={paginatedAudits}
          onRowClick={(row) => selectAudit(row)}
        />
      </div>

      {/* ── Simple Pagination Footer ────────────────── */}
      {totalPages > 1 && (
        <div className={styles.paginationFooter}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setPage(p => p - 1)}
            className={styles.pageBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}

      <CreateAuditSlideOver />
      <AuditDetailModal />
    </div>
  );
}
