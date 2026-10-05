import { useCallback, useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Cpu,
    HardDrive,
    Database,
    Monitor,
    Package,
    ShieldAlert,
    Wrench,
} from 'lucide-react';

import { getAsset } from '../api/assets';
import { ErrorState, PageSkeleton } from './UiStates';

function getPatchClass(status) {
    if (status === 'Full') return 'badge-success';
    if (status === 'Partial') return 'badge-warning';
    return 'badge-danger';
}

function getSeverityClass(severity) {
    if (severity === 'CRITICAL') return 'badge-danger';
    if (severity === 'HIGH') return 'badge-warning';
    if (severity === 'MEDIUM') return 'badge-info';
    return 'badge-neutral';
}

function getStatusClass(status) {
    if (status === 'Mitigated') return 'badge-success';
    if (status === 'Open') return 'badge-warning';
    return 'badge-neutral';
}

function AssetDetails({ pcName, onBack }) {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAsset = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAsset(pcName);
            setAsset(data.data);
        } catch (requestError) {
            console.error(requestError);
            setError('The selected endpoint could not be retrieved.');
        } finally {
            setLoading(false);
        }
    }, [pcName]);

    useEffect(() => {
        loadAsset();
    }, [loadAsset]);

    if (loading) {
        return <PageSkeleton cards={4} rows={6} />;
    }

    if (error || !asset) {
        return (
            <ErrorState
                title={asset === null && !error ? 'Asset not found' : 'Unable to load asset'}
                message={error || 'No asset record was returned for this endpoint.'}
                onRetry={loadAsset}
            />
        );
    }

    const softwareCount = asset.software_count ?? asset.software?.length ?? 0;
    const hotfixCount = asset.hotfix_count ?? asset.hotfixes?.length ?? 0;
    const vulnerabilityCount = asset.vuln_count ?? asset.vulnerabilities?.length ?? 0;

    return (
        <div className="page-container asset-profile-page">
            <button className="back-button" type="button" onClick={onBack}>
                <ArrowLeft size={15} />
                Back to Assets
            </button>

            <div className="asset-profile-header">
                <div className="asset-profile-identity">
                    <div className="asset-profile-icon" aria-hidden="true">
                        <Monitor size={22} />
                    </div>

                    <div>
                        <p className="eyebrow">ASSET PROFILE</p>
                        <h2>{asset.pc_name}</h2>
                        <p>
                            {asset.department || 'Unassigned'} · {asset.os_name || 'Unknown OS'}
                        </p>
                    </div>
                </div>

                <div className="asset-profile-statuses">
                    <span className="status-badge badge-neutral">Asset #{asset.id}</span>
                    <span className={`status-badge ${getPatchClass(asset.patch_status)}`}>
                        Patch: {asset.patch_status}
                    </span>
                    <span
                        className={`status-badge ${
                            asset.has_critical_vuln ? 'badge-danger' : 'badge-success'
                        }`}
                    >
                        {asset.has_critical_vuln ? 'Critical Finding' : 'No Critical Finding'}
                    </span>
                </div>
            </div>

            <section className="asset-detail-grid" aria-label="Hardware overview">
                <article className="detail-card">
                    <div className="detail-card-icon" aria-hidden="true">
                        <Cpu size={18} />
                    </div>
                    <span>Processor</span>
                    <strong title={asset.cpu}>{asset.cpu || 'Unknown'}</strong>
                    <small>{asset.cpu_cores} cores</small>
                </article>

                <article className="detail-card">
                    <div className="detail-card-icon" aria-hidden="true">
                        <Database size={18} />
                    </div>
                    <span>Memory</span>
                    <strong>{asset.ram_gb} GB</strong>
                    <small>Installed RAM</small>
                </article>

                <article className="detail-card">
                    <div className="detail-card-icon" aria-hidden="true">
                        <HardDrive size={18} />
                    </div>
                    <span>Storage</span>
                    <strong>{asset.storage_gb} GB</strong>
                    <small>Total capacity</small>
                </article>

                <article className="detail-card">
                    <div
                        className={`detail-card-icon ${
                            asset.has_critical_vuln ? 'detail-icon-danger' : 'detail-icon-success'
                        }`}
                        aria-hidden="true"
                    >
                        {asset.has_critical_vuln ? (
                            <ShieldAlert size={18} />
                        ) : (
                            <CheckCircle2 size={18} />
                        )}
                    </div>
                    <span>Security State</span>
                    <strong>{asset.patch_status}</strong>
                    <small>
                        {asset.has_critical_vuln
                            ? 'Critical vulnerability detected'
                            : 'No critical vulnerability'}
                    </small>
                </article>
            </section>

            <section className="detail-section">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">ENDPOINT POSTURE</p>
                        <h3>Security & Inventory Summary</h3>
                        <p>Key operational indicators for this managed endpoint.</p>
                    </div>
                </div>

                <div className="asset-security-grid">
                    <article className={asset.has_critical_vuln ? 'summary-metric metric-danger' : 'summary-metric'}>
                        <AlertTriangle size={17} />
                        <div>
                            <span>Vulnerabilities</span>
                            <strong>{Number(vulnerabilityCount).toLocaleString()}</strong>
                        </div>
                    </article>

                    <article className="summary-metric">
                        <Package size={17} />
                        <div>
                            <span>Installed Software</span>
                            <strong>{Number(softwareCount).toLocaleString()}</strong>
                        </div>
                    </article>

                    <article className="summary-metric metric-success">
                        <Wrench size={17} />
                        <div>
                            <span>Installed Hotfixes</span>
                            <strong>{Number(hotfixCount).toLocaleString()}</strong>
                        </div>
                    </article>
                </div>
            </section>

            <section className="detail-section">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">INVENTORY</p>
                        <h3>Software Inventory</h3>
                        <p>Applications reported on this endpoint.</p>
                    </div>
                    <span className="section-count">{softwareCount} records</span>
                </div>

                <div className="detail-table-card">
                    <div className="table-scroll">
                        <table className="asset-table">
                            <thead>
                                <tr>
                                    <th>Software</th>
                                    <th>Version</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asset.software?.map((software) => (
                                    <tr key={software.id}>
                                        <td><strong>{software.name}</strong></td>
                                        <td>{software.version || 'N/A'}</td>
                                        <td>
                                            <span className="status-badge badge-neutral">
                                                {software.category || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {!asset.software?.length && (
                                    <tr>
                                        <td colSpan="3" className="empty-state">
                                            <div className="empty-state-content">
                                                <Package size={20} />
                                                <strong>No software records found</strong>
                                                <span>No software inventory was returned for this endpoint.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="detail-section">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">PATCH HISTORY</p>
                        <h3>Installed Hotfixes</h3>
                        <p>Windows updates and patches reported on this endpoint.</p>
                    </div>
                    <span className="section-count">{hotfixCount} records</span>
                </div>

                <div className="detail-table-card">
                    <div className="table-scroll">
                        <table className="asset-table">
                            <thead>
                                <tr>
                                    <th>Hotfix</th>
                                    <th>Installed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asset.hotfixes?.map((hotfix) => (
                                    <tr key={hotfix.id}>
                                        <td><strong>{hotfix.hotfix_id}</strong></td>
                                        <td>{hotfix.installed_date || 'N/A'}</td>
                                    </tr>
                                ))}

                                {!asset.hotfixes?.length && (
                                    <tr>
                                        <td colSpan="2" className="empty-state">
                                            <div className="empty-state-content">
                                                <Wrench size={20} />
                                                <strong>No hotfix records found</strong>
                                                <span>No installed hotfixes were returned for this endpoint.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="detail-section">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">SECURITY FINDINGS</p>
                        <h3>Vulnerabilities</h3>
                        <p>Reported security findings associated with this endpoint.</p>
                    </div>
                    <span className="section-count">{vulnerabilityCount} findings</span>
                </div>

                <div className="detail-table-card">
                    <div className="table-scroll">
                        <table className="asset-table">
                            <thead>
                                <tr>
                                    <th>CVE</th>
                                    <th>Severity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asset.vulnerabilities?.map((vulnerability) => (
                                    <tr key={vulnerability.id}>
                                        <td><strong>{vulnerability.cve_id}</strong></td>
                                        <td>
                                            <span className={`status-badge ${getSeverityClass(vulnerability.severity)}`}>
                                                {vulnerability.severity}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(vulnerability.status)}`}>
                                                {vulnerability.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {!asset.vulnerabilities?.length && (
                                    <tr>
                                        <td colSpan="3" className="empty-state">
                                            <div className="empty-state-content">
                                                <CheckCircle2 size={20} />
                                                <strong>No vulnerabilities found</strong>
                                                <span>No vulnerability records were returned for this endpoint.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AssetDetails;
