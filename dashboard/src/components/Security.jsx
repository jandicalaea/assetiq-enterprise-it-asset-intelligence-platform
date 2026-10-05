import { useCallback, useEffect, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { getSecurityAnalytics } from '../api/analytics';
import ChartTooltip from './ChartTooltip';
import { ErrorState, PageSkeleton } from './UiStates';

const severityColors = {
    CRITICAL: '#dc2626',
    HIGH: '#d97706',
    MEDIUM: '#2563eb',
    LOW: '#16a34a',
};

const patchColors = {
    Full: '#16a34a',
    Partial: '#d97706',
    Minimal: '#dc2626',
};

function severityBadge(severity) {
    if (severity === 'CRITICAL') return 'badge-danger';
    if (severity === 'HIGH') return 'badge-warning';
    if (severity === 'MEDIUM') return 'badge-info';
    return 'badge-neutral';
}

function patchBadge(status) {
    if (status === 'Full') return 'badge-success';
    if (status === 'Partial') return 'badge-warning';
    return 'badge-danger';
}

function Security() {
    const [security, setSecurity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadSecurity = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getSecurityAnalytics();
            setSecurity(data);
        } catch (requestError) {
            console.error(requestError);
            setError('Security analytics could not be retrieved.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSecurity();
    }, [loadSecurity]);

    if (loading) {
        return <PageSkeleton cards={4} rows={5} />;
    }

    if (error || !security) {
        return (
            <ErrorState
                title="Unable to load security data"
                message={error || 'No security analytics were returned by the API.'}
                onRetry={loadSecurity}
            />
        );
    }

    const severity = security.vulnerability_severity || [];
    const status = security.vulnerability_status || [];
    const patchStatus = security.patch_status || [];

    const criticalVulnerabilities = Number(
        severity.find((item) => item.severity === 'CRITICAL')?.count || 0
    );
    const openVulnerabilities = Number(
        status.find((item) => item.status === 'Open')?.count || 0
    );
    const mitigatedVulnerabilities = Number(
        status.find((item) => item.status === 'Mitigated')?.count || 0
    );

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">SECURITY OPERATIONS</p>
                    <h2>Security Posture</h2>
                    <p>
                        Monitor vulnerability exposure, remediation status, and patch
                        coverage across managed endpoints.
                    </p>
                </div>

                <div className="asset-total">
                    <ShieldCheck size={16} />
                    Security Monitoring
                </div>
            </div>

            <section className="security-kpi-grid" aria-label="Security key metrics">
                <article className="security-kpi security-kpi-danger">
                    <div className="security-kpi-icon" aria-hidden="true">
                        <ShieldAlert size={19} />
                    </div>
                    <div>
                        <span>Critical Vulnerabilities</span>
                        <strong>{criticalVulnerabilities.toLocaleString()}</strong>
                        <small>Highest severity findings</small>
                    </div>
                </article>

                <article className="security-kpi security-kpi-warning">
                    <div className="security-kpi-icon" aria-hidden="true">
                        <AlertTriangle size={19} />
                    </div>
                    <div>
                        <span>Open Vulnerabilities</span>
                        <strong>{openVulnerabilities.toLocaleString()}</strong>
                        <small>Awaiting remediation</small>
                    </div>
                </article>

                <article className="security-kpi">
                    <div className="security-kpi-icon" aria-hidden="true">
                        <ShieldAlert size={19} />
                    </div>
                    <div>
                        <span>Critical Assets</span>
                        <strong>{Number(security.critical_assets).toLocaleString()}</strong>
                        <small>Endpoints with critical findings</small>
                    </div>
                </article>

                <article className="security-kpi security-kpi-success">
                    <div className="security-kpi-icon" aria-hidden="true">
                        <CheckCircle2 size={19} />
                    </div>
                    <div>
                        <span>Mitigated Findings</span>
                        <strong>{mitigatedVulnerabilities.toLocaleString()}</strong>
                        <small>Reported as mitigated</small>
                    </div>
                </article>
            </section>

            <section className="section-heading section-heading-spaced">
                <div>
                    <p className="eyebrow">EXPOSURE ANALYSIS</p>
                    <h3>Vulnerability & Patch Distribution</h3>
                    <p>Operational views of severity and patch-compliance data.</p>
                </div>
            </section>

            <section className="security-ops-grid">
                <article className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3>Vulnerability Severity</h3>
                            <p>Findings grouped by severity level.</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={severity}
                                margin={{ top: 10, right: 18, left: -14, bottom: 0 }}
                            >
                                <CartesianGrid
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="severity"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={54}>
                                    {severity.map((item) => (
                                        <Cell
                                            key={item.severity}
                                            fill={severityColors[item.severity] || '#64748b'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3>Patch Compliance</h3>
                            <p>Endpoints grouped by current patch status.</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={patchStatus}
                                    dataKey="count"
                                    nameKey="patch_status"
                                    cx="50%"
                                    cy="47%"
                                    outerRadius={96}
                                    innerRadius={62}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {patchStatus.map((item) => (
                                        <Cell
                                            key={item.patch_status}
                                            fill={patchColors[item.patch_status] || '#64748b'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </article>
            </section>

            <section className="security-tables-grid">
                <div className="detail-section detail-section-compact">
                    <div className="section-heading">
                        <div>
                            <h3>Vulnerability Severity</h3>
                            <p>Exact finding counts by severity.</p>
                        </div>
                    </div>

                    <div className="detail-table-card">
                        <div className="table-scroll">
                            <table className="asset-table compact-table">
                                <thead>
                                    <tr>
                                        <th>Severity</th>
                                        <th className="numeric-cell">Findings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {severity.map((item) => (
                                        <tr key={item.severity}>
                                            <td>
                                                <span className={`status-badge ${severityBadge(item.severity)}`}>
                                                    {item.severity}
                                                </span>
                                            </td>
                                            <td className="numeric-cell">
                                                <strong>{Number(item.count).toLocaleString()}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="detail-section detail-section-compact">
                    <div className="section-heading">
                        <div>
                            <h3>Remediation Status</h3>
                            <p>Current state of reported vulnerability findings.</p>
                        </div>
                    </div>

                    <div className="detail-table-card">
                        <div className="table-scroll">
                            <table className="asset-table compact-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th className="numeric-cell">Findings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {status.map((item) => (
                                        <tr key={item.status}>
                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        item.status === 'Mitigated'
                                                            ? 'badge-success'
                                                            : item.status === 'Open'
                                                              ? 'badge-warning'
                                                              : 'badge-neutral'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="numeric-cell">
                                                <strong>{Number(item.count).toLocaleString()}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="detail-section detail-section-compact">
                    <div className="section-heading">
                        <div>
                            <h3>Patch Status</h3>
                            <p>Endpoint counts by patch coverage level.</p>
                        </div>
                    </div>

                    <div className="detail-table-card">
                        <div className="table-scroll">
                            <table className="asset-table compact-table">
                                <thead>
                                    <tr>
                                        <th>Patch Status</th>
                                        <th className="numeric-cell">Assets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patchStatus.map((item) => (
                                        <tr key={item.patch_status}>
                                            <td>
                                                <span className={`status-badge ${patchBadge(item.patch_status)}`}>
                                                    {item.patch_status}
                                                </span>
                                            </td>
                                            <td className="numeric-cell">
                                                <strong>{Number(item.count).toLocaleString()}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <div className="security-footnote">
                <ShieldCheck size={15} />
                <span>{Number(security.risky_assets).toLocaleString()} assets are currently flagged as risky.</span>
            </div>
        </div>
    );
}

export default Security;
