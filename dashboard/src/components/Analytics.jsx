import { useCallback, useEffect, useState } from 'react';
import {
    BarChart3,
    Cpu,
    Database,
    HardDrive,
    Monitor,
    ShieldAlert,
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

import {
    getHardwareAnalytics,
    getOverview,
    getSecurityAnalytics,
} from '../api/analytics';
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

const osColors = ['#2563eb', '#64748b', '#0f766e', '#7c3aed'];

function Analytics() {
    const [overview, setOverview] = useState(null);
    const [security, setSecurity] = useState(null);
    const [hardware, setHardware] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [overviewData, securityData, hardwareData] = await Promise.all([
                getOverview(),
                getSecurityAnalytics(),
                getHardwareAnalytics(),
            ]);

            setOverview(overviewData);
            setSecurity(securityData);
            setHardware(hardwareData);
        } catch (requestError) {
            console.error(requestError);
            setError('Enterprise analytics could not be retrieved.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    if (loading) {
        return <PageSkeleton cards={4} rows={5} />;
    }

    if (error || !overview || !security || !hardware) {
        return (
            <ErrorState
                title="Unable to load analytics"
                message={error || 'The analytics API did not return a complete dataset.'}
                onRetry={loadAnalytics}
            />
        );
    }

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">ENTERPRISE ANALYTICS</p>
                    <h2>Fleet Distribution & Capacity</h2>
                    <p>
                        Analyze how endpoints, operating systems, security findings, and
                        hardware capacity are distributed across the environment.
                    </p>
                </div>

                <div className="asset-total">
                    <BarChart3 size={16} />
                    Fleet Intelligence
                </div>
            </div>

            <section className="kpi-grid" aria-label="Analytics key metrics">
                <article className="kpi-card">
                    <div className="kpi-icon" aria-hidden="true">
                        <Monitor size={18} />
                    </div>
                    <span>Total Assets</span>
                    <strong>{overview.total_assets.toLocaleString()}</strong>
                    <small>Managed endpoints</small>
                </article>

                <article className="kpi-card">
                    <div className="kpi-icon" aria-hidden="true">
                        <Database size={18} />
                    </div>
                    <span>Software Records</span>
                    <strong>{overview.total_software.toLocaleString()}</strong>
                    <small>Tracked installations</small>
                </article>

                <article className="kpi-card kpi-card-warning">
                    <div className="kpi-icon" aria-hidden="true">
                        <ShieldAlert size={18} />
                    </div>
                    <span>Vulnerabilities</span>
                    <strong>{overview.total_vulnerabilities.toLocaleString()}</strong>
                    <small>{overview.open_vulnerabilities.toLocaleString()} open findings</small>
                </article>

                <article className="kpi-card">
                    <div className="kpi-icon" aria-hidden="true">
                        <HardDrive size={18} />
                    </div>
                    <span>Average RAM</span>
                    <strong>{hardware.averages.ram_gb} GB</strong>
                    <small>Per managed endpoint</small>
                </article>
            </section>

            <section className="section-heading section-heading-spaced">
                <div>
                    <p className="eyebrow">DISTRIBUTION ANALYSIS</p>
                    <h3>Environment Composition</h3>
                    <p>Compare endpoint distribution across organizational and technical dimensions.</p>
                </div>
            </section>

            <section className="analytics-grid">
                <article className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3>Assets by Department</h3>
                            <p>Endpoint distribution across business departments.</p>
                        </div>
                    </div>

                    <div className="chart-container tall">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={hardware.assets_by_department}
                                layout="vertical"
                                margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
                            >
                                <CartesianGrid
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="department"
                                    width={86}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar
                                    dataKey="count"
                                    fill="#2563eb"
                                    radius={[0, 5, 5, 0]}
                                    maxBarSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3>Operating Systems</h3>
                            <p>Operating-system distribution across endpoints.</p>
                        </div>
                    </div>

                    <div className="chart-container tall">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={hardware.assets_by_os}
                                    dataKey="count"
                                    nameKey="os_name"
                                    cx="50%"
                                    cy="47%"
                                    outerRadius={104}
                                    innerRadius={68}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {hardware.assets_by_os.map((item, index) => (
                                        <Cell
                                            key={item.os_name}
                                            fill={osColors[index % osColors.length]}
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

                <article className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3>Vulnerability Severity</h3>
                            <p>Security findings grouped by reported severity.</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={security.vulnerability_severity}
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
                                    {security.vulnerability_severity.map((item) => (
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
                            <p>Managed endpoints grouped by patch coverage.</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={security.patch_status}
                                    dataKey="count"
                                    nameKey="patch_status"
                                    cx="50%"
                                    cy="47%"
                                    outerRadius={96}
                                    innerRadius={62}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {security.patch_status.map((item) => (
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

            <section className="section-heading section-heading-spaced">
                <div>
                    <p className="eyebrow">CAPACITY PROFILE</p>
                    <h3>Hardware & Risk Indicators</h3>
                    <p>High-level capacity averages and risk exposure across the fleet.</p>
                </div>
            </section>

            <section className="analytics-metrics">
                <article>
                    <div className="analytics-metric-icon" aria-hidden="true">
                        <Database size={18} />
                    </div>
                    <span>Average RAM</span>
                    <strong>{hardware.averages.ram_gb} GB</strong>
                    <small>Installed memory per endpoint</small>
                </article>

                <article>
                    <div className="analytics-metric-icon" aria-hidden="true">
                        <HardDrive size={18} />
                    </div>
                    <span>Average Storage</span>
                    <strong>{hardware.averages.storage_gb} GB</strong>
                    <small>Capacity per managed endpoint</small>
                </article>

                <article>
                    <div className="analytics-metric-icon" aria-hidden="true">
                        <Cpu size={18} />
                    </div>
                    <span>Average CPU Cores</span>
                    <strong>{hardware.averages.cpu_cores}</strong>
                    <small>Processing cores per endpoint</small>
                </article>

                <article className="analytics-metric-risk">
                    <div className="analytics-metric-icon" aria-hidden="true">
                        <ShieldAlert size={18} />
                    </div>
                    <span>Risky Assets</span>
                    <strong>{Number(security.risky_assets).toLocaleString()}</strong>
                    <small>Endpoints flagged by current data</small>
                </article>
            </section>
        </div>
    );
}

export default Analytics;
