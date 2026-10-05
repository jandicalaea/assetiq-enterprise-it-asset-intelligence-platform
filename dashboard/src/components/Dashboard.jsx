import { useCallback, useEffect, useState } from 'react';
import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    Cpu,
    Database,
    HardDrive,
    Monitor,
    Package,
    ShieldAlert,
    ShieldCheck,
    Users,
    Wifi,
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

const neutralChartColors = ['#2563eb', '#64748b', '#0f766e', '#7c3aed'];

function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }) {
    return (
        <article className={`stat-card stat-${variant}`}>
            <div className="stat-card-top">
                <div>
                    <p className="stat-title">{title}</p>
                    <h3>{value}</h3>
                </div>

                <div className="stat-icon" aria-hidden="true">
                    <Icon size={20} />
                </div>
            </div>

            <p className="stat-subtitle">{subtitle}</p>
        </article>
    );
}

function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [security, setSecurity] = useState(null);
    const [hardware, setHardware] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboard = useCallback(async () => {
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
            setError('The latest dashboard data could not be retrieved.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    if (loading) {
        return <PageSkeleton cards={4} rows={5} />;
    }

    if (error || !overview || !security || !hardware) {
        return (
            <ErrorState
                title="Unable to load dashboard"
                message={
                    error ||
                    "We couldn't retrieve the latest AssetIQ analytics from the Laravel API."
                }
                onRetry={loadDashboard}
            />
        );
    }

    const severityData =
        security.vulnerability_severity?.map((item) => ({
            name: item.severity,
            value: Number(item.count),
        })) || [];

    const patchData =
        security.patch_status?.map((item) => ({
            name: item.patch_status,
            value: Number(item.count),
        })) || [];

    const departmentData =
        hardware.assets_by_department?.map((item) => ({
            name: item.department,
            value: Number(item.count),
        })) || [];

    const osData =
        hardware.assets_by_os?.map((item) => ({
            name: item.os_name,
            value: Number(item.count),
        })) || [];

    const riskyPercentage = overview.total_assets
        ? Math.round((overview.risky_assets / overview.total_assets) * 100)
        : 0;

    return (
        <div className="dashboard-content">
            <section className="welcome-row">
                <div>
                    <p className="eyebrow">ASSET INTELLIGENCE CENTER</p>
                    <h2>Fleet Overview</h2>
                    <p className="section-description">
                        Monitor infrastructure health, security posture, software
                        inventory, and hardware utilization across the enterprise.
                    </p>
                </div>

                <div className="refresh-status">
                    <Wifi size={15} />
                    Connected to Laravel API
                </div>
            </section>

            <section className="stats-grid" aria-label="Fleet key metrics">
                <StatCard
                    title="Total Assets"
                    value={overview.total_assets.toLocaleString()}
                    subtitle="Managed endpoints"
                    icon={Monitor}
                />
                <StatCard
                    title="Software Inventory"
                    value={overview.total_software.toLocaleString()}
                    subtitle="Installed software records"
                    icon={Package}
                />
                <StatCard
                    title="Security Findings"
                    value={overview.total_vulnerabilities.toLocaleString()}
                    subtitle={`${overview.open_vulnerabilities.toLocaleString()} currently open`}
                    icon={ShieldAlert}
                    variant="warning"
                />
                <StatCard
                    title="Risky Assets"
                    value={overview.risky_assets.toLocaleString()}
                    subtitle={`${riskyPercentage}% of managed fleet`}
                    icon={AlertTriangle}
                    variant="danger"
                />
            </section>

            <section className="section-header">
                <div>
                    <p className="eyebrow">SECURITY POSTURE</p>
                    <h2>Security Overview</h2>
                    <p>Prioritize the findings that require operational attention.</p>
                </div>
            </section>

            <section className="security-summary" aria-label="Security summary">
                <article className="security-card critical">
                    <div className="security-card-icon" aria-hidden="true">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <span>Critical Vulnerabilities</span>
                        <strong>{overview.critical_vulnerabilities.toLocaleString()}</strong>
                        <small>Requires attention</small>
                    </div>
                </article>

                <article className="security-card open">
                    <div className="security-card-icon" aria-hidden="true">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <span>Open Vulnerabilities</span>
                        <strong>{overview.open_vulnerabilities.toLocaleString()}</strong>
                        <small>Active findings</small>
                    </div>
                </article>

                <article className="security-card protected">
                    <div className="security-card-icon" aria-hidden="true">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <span>Critical Assets</span>
                        <strong>{Number(security.critical_assets).toLocaleString()}</strong>
                        <small>Endpoints with critical findings</small>
                    </div>
                </article>
            </section>

            <section className="charts-grid" aria-label="Security charts">
                <article className="panel">
                    <div className="panel-header">
                        <div>
                            <p className="panel-kicker">VULNERABILITY ANALYSIS</p>
                            <h3>Severity Distribution</h3>
                            <p>Findings grouped by reported severity.</p>
                        </div>
                        <div className="panel-icon" aria-hidden="true">
                            <ShieldAlert size={17} />
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={severityData}
                                margin={{ top: 10, right: 16, left: -14, bottom: 0 }}
                            >
                                <CartesianGrid
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
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
                                <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={54}>
                                    {severityData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={severityColors[entry.name] || '#64748b'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="panel">
                    <div className="panel-header">
                        <div>
                            <p className="panel-kicker">PATCH COMPLIANCE</p>
                            <h3>Patch Status</h3>
                            <p>Managed endpoints grouped by patch coverage.</p>
                        </div>
                        <div className="panel-icon" aria-hidden="true">
                            <CheckCircle2 size={17} />
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={patchData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="47%"
                                    outerRadius={96}
                                    innerRadius={62}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {patchData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={patchColors[entry.name] || '#64748b'}
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

            <section className="section-header infrastructure-header">
                <div>
                    <p className="eyebrow">INFRASTRUCTURE INTELLIGENCE</p>
                    <h2>Fleet Composition</h2>
                    <p>Understand how managed assets are distributed across the organization.</p>
                </div>
            </section>

            <section className="charts-grid" aria-label="Infrastructure charts">
                <article className="panel">
                    <div className="panel-header">
                        <div>
                            <p className="panel-kicker">ORGANIZATION</p>
                            <h3>Assets by Department</h3>
                            <p>Endpoint distribution across business units.</p>
                        </div>
                        <div className="panel-icon" aria-hidden="true">
                            <Users size={17} />
                        </div>
                    </div>

                    <div className="chart-container tall">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={departmentData}
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
                                    dataKey="name"
                                    width={86}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar
                                    dataKey="value"
                                    fill="#2563eb"
                                    radius={[0, 5, 5, 0]}
                                    maxBarSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="panel">
                    <div className="panel-header">
                        <div>
                            <p className="panel-kicker">OPERATING SYSTEM</p>
                            <h3>OS Distribution</h3>
                            <p>Operating system mix across managed endpoints.</p>
                        </div>
                        <div className="panel-icon" aria-hidden="true">
                            <Monitor size={17} />
                        </div>
                    </div>

                    <div className="chart-container tall">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={osData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="47%"
                                    outerRadius={102}
                                    innerRadius={68}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {osData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={neutralChartColors[index % neutralChartColors.length]}
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

            <section className="section-header">
                <div>
                    <p className="eyebrow">HARDWARE TELEMETRY</p>
                    <h2>Fleet Hardware Profile</h2>
                    <p>High-level hardware capacity across managed endpoints.</p>
                </div>
            </section>

            <section className="hardware-grid" aria-label="Hardware metrics">
                <article className="hardware-card">
                    <div className="hardware-icon" aria-hidden="true">
                        <Cpu size={20} />
                    </div>
                    <span>Average CPU Cores</span>
                    <strong>{hardware.averages.cpu_cores}</strong>
                    <small>Per managed endpoint</small>
                </article>

                <article className="hardware-card">
                    <div className="hardware-icon" aria-hidden="true">
                        <Database size={20} />
                    </div>
                    <span>Average RAM</span>
                    <strong>{hardware.averages.ram_gb} GB</strong>
                    <small>Installed memory</small>
                </article>

                <article className="hardware-card">
                    <div className="hardware-icon" aria-hidden="true">
                        <HardDrive size={20} />
                    </div>
                    <span>Average Storage</span>
                    <strong>{hardware.averages.storage_gb} GB</strong>
                    <small>Storage capacity per endpoint</small>
                </article>

                <article className="hardware-card">
                    <div className="hardware-icon" aria-hidden="true">
                        <Boxes size={20} />
                    </div>
                    <span>Hotfix Records</span>
                    <strong>{overview.total_hotfixes.toLocaleString()}</strong>
                    <small>Tracked patch installations</small>
                </article>
            </section>
        </div>
    );
}

export default Dashboard;
