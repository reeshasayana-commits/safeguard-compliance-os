import { useEffect, useState, useMemo } from 'react';
import { Plus, Download, Filter, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { DataTable } from '../../components/ui/DataTable';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StatusBadge, resolveVariant } from '../../components/ui/StatusBadge';
import { useRiskStore } from '../../store/useRiskStore';
import { CreateRiskSlideOver } from '../../components/slideover/CreateRiskSlideOver';
import { RiskDetailModal } from '../../components/modal/RiskDetailModal';
import { RiskSeverity } from '../../types/index';
import type { Risk } from '../../types/index';
import styles from './RisksPage.module.css';
import { exportToCSV } from '../../utils/export';

// ── Animation Variants ──────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    }
  }
};

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

// ───────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<RiskSeverity, string> = {
  CRITICAL: 'var(--color-danger)',
  HIGH: 'var(--color-warning)',
  MEDIUM: 'var(--color-info)',
  LOW: 'var(--color-muted)',
};

export function RisksPage() {
  const { risks, isLoading, fetchRisks, selectRisk } = useRiskStore();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // ── Filtered Risks ──────────────────────────────────────────────────
  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const searchable = `${r.riskId} ${r.title} ${r.location.name}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [risks, searchTerm, statusFilter]);

  const handleExport = () => {
    exportToCSV(filteredRisks, `risks-export-${new Date().toISOString().split('T')[0]}`);
  };

  const columns = [
    {
      key: 'riskId',
      header: 'ID',
      width: '120px',
      render: (r: Risk) => <span className={styles.riskId}>{r.riskId}</span>,
    },
    {
      key: 'title',
      header: 'Risk Title',
      width: '2fr',
      render: (r: Risk) => (
        <div className={styles.titleCell}>
          <span className={styles.titleText}>{r.title}</span>
          <span className={styles.locationText}>{r.location.name}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '1fr',
      render: (r: Risk) => (
        <div className={styles.severityWrapper}>
          <div className={styles.severityBar} style={{ backgroundColor: SEVERITY_COLORS[r.severity] }} />
          <span>{r.severity}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '1fr',
      render: (r: Risk) => (
        <StatusBadge variant={resolveVariant(r.status)} dot>
          {r.status.replace(/_/g, ' ')}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      align: 'right' as const,
      render: () => (
        <button className={styles.moreBtn}>
          <MoreHorizontal size={18} />
        </button>
      ),
    },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className={styles.page}
    >
      {/* ── Page Header ───────────────────────────── */}
      <motion.div variants={item} className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Risk Register</h2>
          <p className={styles.subtitle}>Showing {filteredRisks.length} critical items</p>
        </div>

        <div className={styles.actions}>
          <div className={styles.filters}>
            <input 
              type="text" 
              placeholder="Search registry..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <PrimaryButton variant="secondary" icon={<Download size={18} />} onClick={handleExport}>
            Export
          </PrimaryButton>
          <PrimaryButton 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setIsSlideOverOpen(true)}
          >
            New Risk
          </PrimaryButton>
        </div>
      </motion.div>

      {/* ── Stats Summary ─────────────────────────── */}
      <motion.div variants={item} className={styles.statsStrip}>
        <div className={styles.miniStat}>
          <span className={styles.miniLabel}>Critical</span>
          <span className={styles.miniValue}>{risks.filter(r => r.severity === 'CRITICAL').length}</span>
        </div>
        <div className={styles.miniDivider} />
        <div className={styles.miniStat}>
          <span className={styles.miniLabel}>High</span>
          <span className={styles.miniValue}>{risks.filter(r => r.severity === 'HIGH').length}</span>
        </div>
        <div className={styles.miniDivider} />
        <div className={styles.miniStat}>
          <span className={styles.miniLabel}>In Review</span>
          <span className={styles.miniValue}>{risks.filter(r => r.status === 'IN_REVIEW').length}</span>
        </div>
      </motion.div>

      {/* ── Main Data Grid ────────────────────────── */}
      <motion.div variants={item} className={styles.tableWrapper}>
        <DataTable
          id="risk-register-table"
          columns={columns}
          data={filteredRisks}
          isLoading={isLoading}
          onRowClick={(risk) => selectRisk(risk)}
        />
      </motion.div>

      {/* ── Modals & Slide-overs ──────────────────── */}
      <CreateRiskSlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
      />
      <RiskDetailModal />
    </motion.div>
  );
}
