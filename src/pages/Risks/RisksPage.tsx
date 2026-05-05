import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Inbox } from 'lucide-react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge, resolveVariant } from '../../components/ui/StatusBadge';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { RiskFilterBar } from '../../components/filters';
import { CreateRiskSlideOver } from '../../components/slideover';
import { RiskDetailModal } from '../../components/modal';
import { useRiskStore, useFilteredRisks } from '../../store/useRiskStore';
import type { Risk } from '../../types';
import styles from './RisksPage.module.css';

const SEVERITY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'neutral',
};

const columns: Column<Risk>[] = [
  {
    key: 'riskId',
    header: 'Risk ID',
    width: '140px',
    render: (row) => <span className={styles.monospace}>{row.riskId}</span>,
  },
  {
    key: 'title',
    header: 'Title',
    render: (row) => <span className={styles.riskTitle}>{row.title}</span>,
  },
  {
    key: 'location',
    header: 'Location',
    render: (row) => row.location.name,
  },
  {
    key: 'severity',
    header: 'Severity',
    width: '110px',
    render: (row) => (
      <StatusBadge variant={SEVERITY_VARIANT[row.severity] ?? 'neutral'}>
        {row.severity.charAt(0) + row.severity.slice(1).toLowerCase()}
      </StatusBadge>
    ),
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
    key: 'owner',
    header: 'Owner',
    width: '130px',
    render: (row) => row.owner.fullName,
  },
  {
    key: 'lastUpdated',
    header: 'Last Updated',
    width: '120px',
    render: (row) => new Date(row.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  },
];

export function RisksPage() {
  const [page, setPage] = useState(1);
  const { isLoading, fetchRisks, openSlideOver, selectRisk } = useRiskStore();
  const filteredRisks = useFilteredRisks();

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // Reset to page 1 when filtered results change
  useEffect(() => {
    setPage(1);
  }, [filteredRisks.length]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredRisks.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRisks = filteredRisks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.page}>
      {/* ── Filter Bar ──────────────────────────── */}
      <div className={styles.header}>
        <RiskFilterBar />
        <div className={styles.headerAction}>
          <PrimaryButton icon={<Plus size={16} />} onClick={openSlideOver}>
            Report Risk
          </PrimaryButton>
        </div>
      </div>

      {/* ── Table ───────────────────────────────── */}
      <div className={styles.tableWrapper}>
        <DataTable<Risk>
          id="risks-table"
          columns={columns}
          data={paginatedRisks}
          rowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage="No risks match the current filters"
          emptyIcon={<Inbox size={40} />}
          onRowClick={(row) => selectRisk(row)}
          pagination={{
            page: currentPage,
            pageSize,
            total: filteredRisks.length,
            onPageChange: setPage,
          }}
        />
      </div>

      {/* Slide-over for creating new risks */}
      <CreateRiskSlideOver />

      {/* Detail modal triggered by row click */}
      <RiskDetailModal />
    </div>
  );
}
