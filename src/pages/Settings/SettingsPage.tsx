import { useState } from 'react';
import toast from 'react-hot-toast';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore, getAvatarInitials } from '../../store/useAuthStore';
import styles from './SettingsPage.module.css';

// ---------------------------------------------------------------------------
// Tab Definitions
// ---------------------------------------------------------------------------

const TABS = ['Profile', 'Team', 'Notifications', 'Integrations', 'Security'] as const;
type TabId = (typeof TABS)[number];

const TEAM_MEMBERS = [
  { name: 'Ananya Sharma', email: 'ananya@safeguard.io', role: 'Auditor', active: true },
  { name: 'Raj Patel', email: 'raj@safeguard.io', role: 'Manager', active: true },
  { name: 'Priya Nair', email: 'priya@safeguard.io', role: 'Auditor', active: true },
  { name: 'Arjun Mehta', email: 'arjun@safeguard.io', role: 'Viewer', active: false },
];

// ---------------------------------------------------------------------------
// Tab Content Components
// ---------------------------------------------------------------------------

function ProfileTab() {
  const { user, updateProfile } = useAuthStore();
  
  // Controlled form state so changes are reflected in real-time
  const [profile, setProfile] = useState({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
    phone: user.phone,
  });

  const updateField = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfile(profile);
    toast.success(`Profile saved — ${profile.fullName}`);
  };

  const handleCancel = () => {
    setProfile({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
    });
    toast('Changes reverted', { icon: '↩️' });
  };

  return (
    <Card title="Profile Information" subtitle="Update your personal details">
      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className={styles.avatarRow}>
          <div className={styles.avatar}>{getAvatarInitials(profile.fullName)}</div>
          <PrimaryButton variant="secondary" size="sm">Change Photo</PrimaryButton>
        </div>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              value={profile.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={profile.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <select
              className={styles.select}
              value={profile.role}
              onChange={(e) => updateField('role', e.target.value)}
            >
              <option>Admin</option>
              <option>Auditor</option>
              <option>Manager</option>
              <option>Viewer</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Department</label>
            <input
              className={styles.input}
              value={profile.department}
              onChange={(e) => updateField('department', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Phone</label>
            <input
              className={styles.input}
              type="tel"
              value={profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <PrimaryButton variant="secondary" onClick={handleCancel}>Cancel</PrimaryButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}

function TeamTab() {
  return (
    <Card title="Team Members" subtitle="Manage your team access">
      <table className={styles.miniTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {TEAM_MEMBERS.map((m) => (
            <tr key={m.email}>
              <td className={styles.memberName}>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.role}</td>
              <td>
                <StatusBadge variant={m.active ? 'success' : 'neutral'} dot>
                  {m.active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailOnAssign: true,
    dailyDigest: false,
    auditComplete: true,
    workflowChange: true,
    weeklyReport: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items: { key: keyof typeof prefs; label: string }[] = [
    { key: 'emailOnAssign', label: 'Email on new risk assignment' },
    { key: 'dailyDigest', label: 'Daily digest summary' },
    { key: 'auditComplete', label: 'Audit completion alerts' },
    { key: 'workflowChange', label: 'Workflow state change alerts' },
    { key: 'weeklyReport', label: 'Weekly compliance report' },
  ];

  return (
    <Card title="Notification Preferences" subtitle="Choose what alerts you receive">
      <div className={styles.notifList}>
        {items.map((item) => (
          <label key={item.key} className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={prefs[item.key]}
              onChange={() => toggle(item.key)}
              className={styles.checkbox}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className={styles.formActions}>
        <PrimaryButton variant="secondary" onClick={() => {
          setPrefs({ emailOnAssign: true, dailyDigest: false, auditComplete: true, workflowChange: true, weeklyReport: false });
          toast('Preferences reset to defaults', { icon: '↩️' });
        }}>Reset Defaults</PrimaryButton>
        <PrimaryButton onClick={() => toast.success('Notification preferences saved')}>
          Save Preferences
        </PrimaryButton>
      </div>
    </Card>
  );
}

function IntegrationsTab() {
  const [connections, setConnections] = useState<Record<string, boolean>>({
    Slack: true,
    Jira: false,
    'Google Sheets': true,
    'Power BI': false,
  });

  const integrations = [
    { name: 'Slack', desc: 'Post alerts to #safety-compliance channel' },
    { name: 'Jira', desc: 'Sync risks as Jira tickets' },
    { name: 'Google Sheets', desc: 'Auto-export monthly reports' },
    { name: 'Power BI', desc: 'Real-time compliance dashboards' },
  ];

  const toggleConnection = (name: string) => {
    const newState = !connections[name];
    setConnections((prev) => ({ ...prev, [name]: newState }));
    toast.success(`${name} ${newState ? 'connected' : 'disconnected'}`);
  };

  return (
    <Card title="Integrations" subtitle="Connect SafeGuard with external services">
      <div className={styles.integrationGrid}>
        {integrations.map((integration) => {
          const connected = connections[integration.name];
          return (
            <div key={integration.name} className={styles.integrationCard}>
              <div className={styles.integrationHeader}>
                <span className={styles.integrationName}>{integration.name}</span>
                <StatusBadge variant={connected ? 'success' : 'neutral'} dot>
                  {connected ? 'Connected' : 'Not connected'}
                </StatusBadge>
              </div>
              <p className={styles.integrationDesc}>{integration.desc}</p>
              <PrimaryButton
                variant={connected ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => toggleConnection(integration.name)}
              >
                {connected ? 'Disconnect' : 'Connect'}
              </PrimaryButton>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <Card title="Security & Authentication" subtitle="Manage your account security">
      <div className={styles.form}>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Current Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.securityInfo}>
          <div className={styles.securityRow}>
            <span>Two-Factor Authentication</span>
            <StatusBadge variant="warning" dot>Disabled</StatusBadge>
          </div>
          <div className={styles.securityRow}>
            <span>Last login</span>
            <span className={styles.muted}>Today at 8:15 PM IST</span>
          </div>
          <div className={styles.securityRow}>
            <span>Active sessions</span>
            <span className={styles.muted}>1 device</span>
          </div>
        </div>

        <div className={styles.formActions}>
          <PrimaryButton variant="secondary" onClick={() => toast('2FA setup coming soon', { icon: '🔐' })}>
            Enable 2FA
          </PrimaryButton>
          <PrimaryButton onClick={handleUpdatePassword}>
            Update Password
          </PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab Renderer
// ---------------------------------------------------------------------------

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  Profile: ProfileTab,
  Team: TeamTab,
  Notifications: NotificationsTab,
  Integrations: IntegrationsTab,
  Security: SecurityTab,
};

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('Profile');
  const ActiveTabContent = TAB_COMPONENTS[activeTab];

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── Tab Nav ───────────────────────────────── */}
        <nav className={styles.tabNav}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* ── Content ──────────────────────────────── */}
        <div className={styles.content}>
          <ActiveTabContent />
        </div>
      </div>
    </div>
  );
}
