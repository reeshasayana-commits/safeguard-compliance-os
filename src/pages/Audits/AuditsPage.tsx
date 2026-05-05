import { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge, resolveVariant } from '../../components/ui/StatusBadge';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuditStore } from '../../store/useAuditStore';
import { CreateAuditSlideOver } from '../../components/slideover';
import type { Audit } from '../../types';
import styles from './AuditsPage.module.css';

const columns: Column<Audit>[] = [
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
    render: () => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="View audit"><Eye size={16} /></button>
        <button className={styles.iconBtn} aria-label="Edit audit"><Pencil size={16} /></button>
      </div>
    ),
  },
];

export function AuditsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 8;
  
  const { audits, fetchAudits, openSlideOver } = useAuditStore();

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  // ── Filtered Audits — search + status filter ────────────────────────
  // BUG FIX: Compare status case-insensitively since dropdown values
  // may not match AuditStatus enum casing exactly
  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      // Search filter — matches audit ID, location, or auditor name
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const searchable = `${audit.auditId} ${audit.location.name} ${audit.auditor.fullName} ${audit.unitName ?? ''}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Status filter — case-insensitive comparison
      if (statusFilter && audit.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      return true;
    });
  }, [searchTerm, statusFilter, audits]);

  // ── Pagination — slice the filtered array ───────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAudits.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedAudits = filteredAudits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search audits..."
            className={styles.searchInput}
            aria-label="Search audits"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <PrimaryButton icon={<Plus size={16} />} onClick={openSlideOver}>Add Audit</PrimaryButton>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div className={styles.tableWrapper}>
        <DataTable<Audit>
          id="audits-table"
          columns={columns}
          data={paginatedAudits}
          rowKey={(row) => row.id}
          pagination={{
            page: currentPage,
            pageSize,
            total: filteredAudits.length,
            onPageChange: setPage,
          }}
        />
      </div>
      <CreateAuditSlideOver />
    </div>
  );
}
