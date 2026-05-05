import { TrendingUp, TrendingDown, AlertCircle, ClipboardCheck, ShieldCheck, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MOCK_DASHBOARD_STATS, MOCK_RISKS_BY_STATUS, MOCK_ACTIVITY } from '../../data/mock-data';
import styles from './DashboardPage.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const stats = MOCK_DASHBOARD_STATS;
  const risksByStatus = MOCK_RISKS_BY_STATUS;
  const activity = MOCK_ACTIVITY;
  const riskTotal = risksByStatus.open + risksByStatus.inReview + risksByStatus.mitigated + risksByStatus.closed;

  return (
    <div className={styles.page}>
      {/* ── Stat Cards ──────────────────────────────── */}
      <div className={styles.statsGrid}>
        <StatCard
          id="stat-total-risks"
          label="Total Risks"
          value={stats.totalRisks}
          trend={stats.totalRisksTrend}
          icon={<BarChart3 size={20} />}
        />
        <StatCard
          id="stat-open-risks"
          label="Open Risks"
          value={stats.openRisks}
          trend={stats.openRisksTrend}
          icon={<AlertCircle size={20} />}
          dot="var(--color-danger)"
        />
        <StatCard
          id="stat-pending-audits"
          label="Pending Audits"
          value={stats.pendingAudits}
          trend={stats.pendingAuditsTrend}
          trendSuffix=""
          icon={<ClipboardCheck size={20} />}
        />
        <StatCard
          id="stat-compliance"
          label="Compliance Score"
          value={`${stats.complianceScore}%`}
          trend={stats.complianceScoreTrend}
          icon={<ShieldCheck size={20} />}
        />
      </div>

      {/* ── Two-Column: Activity + Risks by Status ── */}
      <div className={styles.twoCol}>
        {/* Recent Activity */}
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

        {/* Risks by Status */}
        <Card id="risks-by-status" title="Risks by Status" className={styles.statusCard}>
          <div className={styles.donutContainer}>
            <svg viewBox="0 0 160 160" className={styles.donut}>
              <DonutSegment total={riskTotal} value={risksByStatus.closed} offset={0} color="#94A3B8" />
              <DonutSegment total={riskTotal} value={risksByStatus.mitigated} offset={risksByStatus.closed} color="#16A34A" />
              <DonutSegment total={riskTotal} value={risksByStatus.inReview} offset={risksByStatus.closed + risksByStatus.mitigated} color="#D97706" />
              <DonutSegment total={riskTotal} value={risksByStatus.open} offset={risksByStatus.closed + risksByStatus.mitigated + risksByStatus.inReview} color="#DC2626" />
              <text x="80" y="76" textAnchor="middle" className={styles.donutTotal}>{riskTotal}</text>
              <text x="80" y="94" textAnchor="middle" className={styles.donutLabel}>Total</text>
            </svg>
          </div>

          <div className={styles.legend}>
            <LegendItem color="#DC2626" label="Open" count={risksByStatus.open} />
            <LegendItem color="#D97706" label="In Review" count={risksByStatus.inReview} />
            <LegendItem color="#16A34A" label="Mitigated" count={risksByStatus.mitigated} />
            <LegendItem color="#94A3B8" label="Closed" count={risksByStatus.closed} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (private to this page)
// ---------------------------------------------------------------------------

interface StatCardProps {
  id: string;
  label: string;
  value: number | string;
  trend: number;
  trendSuffix?: string;
  icon: React.ReactNode;
  dot?: string;
}

function StatCard({ id, label, value, trend, trendSuffix = '%', icon, dot }: StatCardProps) {
  const isPositiveTrend = trend >= 0;

  return (
    <div id={id} className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statIcon}>{icon}</span>
        {dot && <span className={styles.statDot} style={{ backgroundColor: dot }} />}
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statFooter}>
        <span className={styles.statLabel}>{label}</span>
        <StatusBadge variant={isPositiveTrend && label !== 'Open Risks' ? 'success' : trend < 0 && label === 'Open Risks' ? 'success' : 'warning'}>
          {isPositiveTrend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {formatTrend(trend, trendSuffix)}
        </StatusBadge>
      </div>
    </div>
  );
}

function DonutSegment({ total, value, offset, color }: { total: number; value: number; offset: number; color: string }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const pct = value / total;
  const offsetPct = offset / total;

  return (
    <circle
      cx="80"
      cy="80"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth="20"
      strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
      strokeDashoffset={-circumference * offsetPct}
      transform="rotate(-90 80 80)"
      style={{ transition: 'stroke-dasharray 0.6s ease' }}
    />
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ backgroundColor: color }} />
      <span className={styles.legendLabel}>{label}</span>
      <span className={styles.legendCount}>{count}</span>
    </div>
  );
}
