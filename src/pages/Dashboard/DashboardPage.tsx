import { useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, ClipboardCheck, ShieldCheck, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MOCK_ACTIVITY } from '../../data/mock-data';
import { useRiskStore } from '../../store/useRiskStore';
import { useAuditStore } from '../../store/useAuditStore';
import styles from './DashboardPage.module.css';

// ── Animation Variants ──────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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

function formatTrend(value: number, suffix: string = '%'): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}${suffix}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTIVITY_DOT_COLOR: Record<string, string> = {
  audit_completed: 'var(--color-success)',
  policy_updated: 'var(--color-success)',
  risk_review: 'var(--color-warning)',
  audit_scheduled: 'var(--color-warning)',
  risk_detected: 'var(--color-danger)',
};

export function DashboardPage() {
  const { stats: riskStats, fetchStats: fetchRiskStats, fetchRisks, isLoading: riskLoading } = useRiskStore();
  const { stats: auditStats, fetchAudits, isLoading: auditLoading } = useAuditStore();
  
  const activity = MOCK_ACTIVITY;
  const riskTotal = riskStats.totalRisks;
  const isLoading = (riskLoading && riskStats.totalRisks === 0) || (auditLoading && auditStats.totalAudits === 0);

  useEffect(() => {
    fetchRiskStats();
    fetchRisks();
    fetchAudits();
  }, [fetchRiskStats, fetchRisks, fetchAudits]);

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Orchestrating live compliance engine...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className={styles.page}
    >
      {/* ── Stat Cards ──────────────────────────────── */}
      <div className={styles.statsGrid}>
        <motion.div variants={item}>
          <StatCard
            id="stat-total-risks"
            label="Total Risks"
            value={riskStats.totalRisks}
            trend={0}
            icon={<BarChart3 size={20} />}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            id="stat-open-risks"
            label="Open Risks"
            value={riskStats.openRisks}
            trend={0}
            icon={<AlertCircle size={20} />}
            dot="var(--color-danger)"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            id="stat-pending-audits"
            label="Pending Audits"
            value={auditStats.scheduled + auditStats.inProgress}
            trend={0}
            trendSuffix=""
            icon={<ClipboardCheck size={20} />}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            id="stat-compliance"
            label="Compliance Score"
            value={`${auditStats.avgScore}%`}
            trend={0}
            icon={<ShieldCheck size={20} />}
          />
        </motion.div>
      </div>

      {/* ── Two-Column: Activity + Risks by Status ── */}
      <div className={styles.twoCol}>
        <motion.div variants={item} className={styles.col}>
          <Card id="recent-activity" title="Recent Activity" className={styles.activityCard}>
            <ul className={styles.activityList}>
              {activity.map((item) => (
                <li key={item.id} className={styles.activityItem}>
                  <span
                    className={styles.activityDot}
                    style={{ backgroundColor: ACTIVITY_DOT_COLOR[item.type] ?? 'var(--color-muted)' }}
                  />
                  <div className={styles.activityContent}>
                    <span className={styles.activityTitle}>{item.title}</span>
                    <span className={styles.activityDesc}>{item.description}</span>
                  </div>
                  <span className={styles.activityTime}>{relativeTime(item.timestamp)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        <motion.div variants={item} className={styles.col}>
          <Card id="risks-by-status" title="Risks by Status" className={styles.statusCard}>
            <div className={styles.donutContainer}>
              <svg viewBox="0 0 160 160" className={styles.donut}>
                <DonutSegment total={riskTotal} value={riskStats.closed} offset={0} color="#94A3B8" />
                <DonutSegment total={riskTotal} value={riskStats.mitigated} offset={riskStats.closed} color="#16A34A" />
                <DonutSegment total={riskTotal} value={riskStats.inReview} offset={riskStats.closed + riskStats.mitigated} color="#D97706" />
                <DonutSegment total={riskTotal} value={riskStats.openRisks} offset={riskStats.closed + riskStats.mitigated + riskStats.inReview} color="#DC2626" />
                <text x="80" y="76" textAnchor="middle" className={styles.donutTotal}>{riskTotal}</text>
                <text x="80" y="94" textAnchor="middle" className={styles.donutLabel}>Total</text>
              </svg>
            </div>

            <div className={styles.legend}>
              <LegendItem color="#DC2626" label="Open" count={riskStats.openRisks} />
              <LegendItem color="#D97706" label="In Review" count={riskStats.inReview} />
              <LegendItem color="#16A34A" label="Mitigated" count={riskStats.mitigated} />
              <LegendItem color="#94A3B8" label="Closed" count={riskStats.closed} />
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────

function StatCard({ label, value, trend, trendSuffix = '%', icon, dot }: any) {
  const isPositiveTrend = trend >= 0;

  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statIcon}>{icon}</span>
        {dot && <span className={styles.statDot} style={{ backgroundColor: dot }} />}
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statFooter}>
        <span className={styles.statLabel}>{label}</span>
        <StatusBadge variant={isPositiveTrend && label !== 'Open Risks' ? 'success' : 'warning'}>
          {isPositiveTrend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {formatTrend(trend, trendSuffix)}
        </StatusBadge>
      </div>
    </div>
  );
}

function DonutSegment({ total, value, offset, color }: any) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? value / total : 0;
  const offsetPct = total > 0 ? offset / total : 0;

  return (
    <motion.circle
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      cx="80"
      cy="80"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth="18"
      strokeDasharray={`${circumference}`}
      strokeDashoffset={circumference * (1 - pct)}
      transform={`rotate(${-90 + (offsetPct * 360)} 80 80)`}
      strokeLinecap="round"
    />
  );
}

function LegendItem({ color, label, count }: any) {
  return (
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ backgroundColor: color }} />
      <span className={styles.legendLabel}>{label}</span>
      <span className={styles.legendCount}>{count}</span>
    </div>
  );
}
