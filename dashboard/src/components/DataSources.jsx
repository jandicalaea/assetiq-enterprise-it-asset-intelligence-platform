import { useCallback, useEffect, useState } from 'react';
import {
    Activity,
    ArrowRight,
    Database,
    FileText,
    Monitor,
    Package,
    RefreshCw,
    Server,
    ShieldAlert,
    Terminal,
    Wrench,
} from 'lucide-react';

import { getOverview } from '../api/analytics';
import { API_BASE_URL } from '../api/client';

const pipeline = [
    {
        label: 'Belarc Reports',
        description: 'Endpoint inventory source files',
        meta: 'External input',
        icon: FileText,
    },
    {
        label: 'PowerShell / Python ETL',
        description: 'Parsing and transformation layer',
        meta: 'Backend-managed',
        icon: Terminal,
    },
    {
        label: 'MySQL / MariaDB',
        description: 'Persistent enterprise asset store',
        meta: 'Backend-managed',
        icon: Database,
    },
    {
        label: 'Laravel REST API',
        description: 'Application and data access layer',
        meta: 'Live probe',
        icon: Server,
        live: true,
    },
    {
        label: 'React Client',
        description: 'AssetIQ presentation layer',
        meta: 'Current application',
        icon: Monitor,
    },
];

const endpoints = [
    { method: 'POST', path: '/login', purpose: 'Create an authenticated AssetIQ session' },
    { method: 'POST', path: '/logout', purpose: 'Terminate the current authenticated session' },
    { method: 'GET', path: '/user', purpose: 'Return the current authenticated user' },
    { method: 'GET', path: '/assets', purpose: 'Paginated enterprise asset inventory' },
    { method: 'GET', path: '/assets/{pc_name}', purpose: 'Endpoint profile and related records' },
    { method: 'GET', path: '/assets/{pc_name}/software', purpose: 'Installed software by endpoint' },
    { method: 'GET', path: '/assets/{pc_name}/hotfixes', purpose: 'Installed hotfixes by endpoint' },
    { method: 'GET', path: '/assets/{pc_name}/vulnerabilities', purpose: 'Vulnerability findings by endpoint' },
    { method: 'GET', path: '/analytics/overview', purpose: 'Fleet-wide headline metrics' },
    { method: 'GET', path: '/analytics/security', purpose: 'Security posture analytics' },
    { method: 'GET', path: '/analytics/hardware', purpose: 'Hardware and fleet distribution analytics' },
];

function DataSources() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const data = await getOverview();
            setOverview(data);
        } catch (requestError) {
            console.error(requestError);
            setOverview(null);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const managedData = [
        {
            label: 'Assets',
            value: overview?.total_assets,
            helper: 'Managed endpoints',
            icon: Monitor,
        },
        {
            label: 'Software',
            value: overview?.total_software,
            helper: 'Installed records',
            icon: Package,
        },
        {
            label: 'Hotfixes',
            value: overview?.total_hotfixes,
            helper: 'Patch records',
            icon: Wrench,
        },
        {
            label: 'Vulnerabilities',
            value: overview?.total_vulnerabilities,
            helper: 'Security findings',
            icon: ShieldAlert,
        },
    ];

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">SYSTEM INTEGRATION</p>
                    <h2>Data Sources</h2>
                    <p>
                        Inspect the data path that supplies AssetIQ and verify the
                        frontend&apos;s connection to the Laravel API.
                    </p>
                </div>

                <div
                    className={`source-connection-chip ${error ? 'is-error' : ''} ${
                        loading ? 'is-pending' : ''
                    }`}
                >
                    <span className="connection-dot" />
                    {loading ? 'Checking API' : error ? 'API Unavailable' : 'API Connected'}
                </div>
            </div>

            <section className="source-section" aria-labelledby="pipeline-heading">
                <div className="section-heading source-section-heading">
                    <div>
                        <p className="eyebrow">DATA FLOW</p>
                        <h3 id="pipeline-heading">Infrastructure Pipeline</h3>
                        <p>
                            AssetIQ separates collection, transformation, storage, API access,
                            and presentation into distinct layers.
                        </p>
                    </div>
                </div>

                <div className="pipeline-card">
                    <div className="pipeline-flow">
                        {pipeline.map((step, index) => {
                            const Icon = step.icon;
                            const liveState = step.live
                                ? loading
                                    ? 'pending'
                                    : error
                                      ? 'error'
                                      : 'success'
                                : null;

                            return (
                                <div className="pipeline-segment" key={step.label}>
                                    <article className="pipeline-node">
                                        <div className="pipeline-node-top">
                                            <div className="pipeline-node-icon">
                                                <Icon size={18} />
                                            </div>
                                            {step.live && (
                                                <span
                                                    className={`pipeline-live-dot ${
                                                        liveState ? `is-${liveState}` : ''
                                                    }`}
                                                    aria-label={
                                                        loading
                                                            ? 'Connection check in progress'
                                                            : error
                                                              ? 'API unavailable'
                                                              : 'API reachable'
                                                    }
                                                />
                                            )}
                                        </div>
                                        <strong>{step.label}</strong>
                                        <span>{step.description}</span>
                                        <small>{step.meta}</small>
                                    </article>

                                    {index < pipeline.length - 1 && (
                                        <div className="pipeline-arrow" aria-hidden="true">
                                            <ArrowRight size={17} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="source-section" aria-labelledby="managed-data-heading">
                <div className="section-heading source-section-heading">
                    <div>
                        <p className="eyebrow">CURRENT DATASET</p>
                        <h3 id="managed-data-heading">Managed Data</h3>
                        <p>
                            Counts are read from the existing AssetIQ analytics endpoint and
                            are not hardcoded in this page.
                        </p>
                    </div>
                </div>

                <div className="source-stats-grid" aria-busy={loading}>
                    {managedData.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article className="source-stat-card" key={item.label}>
                                <div className="source-stat-icon">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <span>{item.label}</span>
                                    {loading ? (
                                        <div className="source-stat-skeleton" aria-hidden="true" />
                                    ) : (
                                        <strong>
                                            {typeof item.value === 'number'
                                                ? item.value.toLocaleString()
                                                : '—'}
                                        </strong>
                                    )}
                                    <small>{error ? 'Unavailable from API' : item.helper}</small>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <div className="source-detail-grid">
                <section className="settings-card" aria-labelledby="connection-heading">
                    <div className="settings-card-header">
                        <div className="settings-card-icon">
                            <Activity size={18} />
                        </div>
                        <div>
                            <p className="eyebrow">CONNECTIVITY</p>
                            <h3 id="connection-heading">Laravel API</h3>
                        </div>
                    </div>

                    <div className="connection-summary">
                        <div className="connection-summary-status">
                            <span
                                className={`status-dot ${error ? 'status-dot-error' : ''} ${
                                    loading ? 'status-dot-pending' : ''
                                }`}
                            />
                            <div>
                                <strong>
                                    {loading
                                        ? 'Verifying connection'
                                        : error
                                          ? 'API request failed'
                                          : 'Frontend request succeeded'}
                                </strong>
                                <span>
                                    {error
                                        ? 'Start the Laravel server and confirm the API URL.'
                                        : 'Status reflects a real request to /analytics/overview.'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={loadOverview}
                            disabled={loading}
                        >
                            <RefreshCw size={15} />
                            {loading ? 'Checking' : 'Retry'}
                        </button>
                    </div>

                    <div className="config-row">
                        <span>API base URL</span>
                        <code>{API_BASE_URL}</code>
                    </div>
                </section>

                <aside className="source-note-card">
                    <div className="source-note-icon">
                        <Database size={18} />
                    </div>
                    <div>
                        <strong>Frontend visibility boundary</strong>
                        <p>
                            The React client can verify the Laravel API because it communicates
                            with it directly. ETL execution and database health are managed
                            behind the API, so this page does not pretend to probe those layers
                            independently.
                        </p>
                    </div>
                </aside>
            </div>

            <section className="source-section" aria-labelledby="resources-heading">
                <div className="section-heading source-section-heading">
                    <div>
                        <p className="eyebrow">REST INTERFACE</p>
                        <h3 id="resources-heading">API Resources</h3>
                        <p>Authenticated REST resources currently used by the AssetIQ frontend.</p>
                    </div>
                </div>

                <div className="asset-table-card">
                    <div className="table-scroll">
                        <table className="asset-table api-resource-table">
                            <thead>
                                <tr>
                                    <th>Method</th>
                                    <th>Resource</th>
                                    <th>Purpose</th>
                                </tr>
                            </thead>
                            <tbody>
                                {endpoints.map((endpoint) => (
                                    <tr key={`${endpoint.method}-${endpoint.path}`}>
                                        <td>
                                            <span className={`status-badge ${endpoint.method === 'POST' ? 'badge-warning' : 'badge-info'}`}>{endpoint.method}</span>
                                        </td>
                                        <td>
                                            <code className="endpoint-code">{endpoint.path}</code>
                                        </td>
                                        <td>{endpoint.purpose}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default DataSources;
