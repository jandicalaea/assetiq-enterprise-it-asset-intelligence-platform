import { useCallback, useEffect, useState } from 'react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Search,
    ShieldCheck,
} from 'lucide-react';

import { getAssets } from '../api/assets';
import AssetDetails from './AssetDetails';
import { ErrorState, PageSkeleton } from './UiStates';

function Assets() {
    const [assets, setAssets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalAssets, setTotalAssets] = useState(null);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            setDebouncedSearch(search.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const loadAssets = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAssets(
                currentPage,
                20,
                debouncedSearch
            );

            setAssets(data.data || []);
            setLastPage(data.meta?.last_page || 1);
            setTotalAssets(
                data.meta?.total ??
                data.data?.length ??
                0
            );
        } catch (requestError) {
            console.error(requestError);
            setError('The asset inventory could not be retrieved.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    const getPatchClass = (status) => {
        if (status === 'Full') return 'badge-success';
        if (status === 'Partial') return 'badge-warning';

        return 'badge-danger';
    };

    const openAsset = (pcName) => {
        setSelectedAsset(pcName);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (selectedAsset) {
        return (
            <AssetDetails
                pcName={selectedAsset}
                onBack={() => setSelectedAsset(null)}
            />
        );
    }

    if (loading && !assets.length) {
        return <PageSkeleton cards={0} rows={8} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Unable to load assets"
                message={error}
                onRetry={loadAssets}
            />
        );
    }

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        ASSET MANAGEMENT
                    </p>

                    <h2>IT Assets</h2>

                    <p>
                        Browse and monitor managed enterprise
                        endpoints.
                    </p>
                </div>

                <div className="asset-total">
                    <Monitor size={16} />

                    {totalAssets !== null
                        ? `${totalAssets.toLocaleString()} Assets`
                        : 'Asset Inventory'}
                </div>
            </div>

            <div className="asset-toolbar">
                <div className="search-box">
                    <Search size={16} />

                    <input
                        type="search"
                        aria-label="Search all assets"
                        placeholder="Search all assets by PC, department, OS, CPU..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <div className="toolbar-note">
                    {debouncedSearch
                        ? `${totalAssets ?? 0} match${
                              totalAssets === 1 ? '' : 'es'
                          } · Page ${currentPage} of ${lastPage}`
                        : `Page ${currentPage} of ${lastPage}`}
                </div>
            </div>

            <div
                className={`asset-table-card ${
                    loading ? 'is-loading' : ''
                }`}
            >
                <div className="table-scroll">
                    <table className="asset-table">
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Department</th>
                                <th>Operating System</th>
                                <th>CPU</th>
                                <th>RAM</th>
                                <th className="numeric-cell">
                                    Software
                                </th>
                                <th className="numeric-cell">
                                    Vulnerabilities
                                </th>
                                <th>Patch Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {assets.map((asset) => (
                                <tr
                                    key={asset.id}
                                    onClick={() =>
                                        openAsset(asset.pc_name)
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key ===
                                                'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            openAsset(
                                                asset.pc_name
                                            );
                                        }
                                    }}
                                    className="asset-row-clickable"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Open details for ${asset.pc_name}`}
                                >
                                    <td>
                                        <div className="asset-name">
                                            <div
                                                className="asset-icon"
                                                aria-hidden="true"
                                            >
                                                <Monitor
                                                    size={15}
                                                />
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        asset.pc_name
                                                    }
                                                </strong>

                                                <span>
                                                    Asset #
                                                    {asset.id}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        {asset.department ||
                                            '—'}
                                    </td>

                                    <td>
                                        <span className="os-name">
                                            {asset.os_name ||
                                                '—'}
                                        </span>
                                    </td>

                                    <td
                                        className="truncate-cell"
                                        title={asset.cpu || ''}
                                    >
                                        {asset.cpu || '—'}
                                    </td>

                                    <td>
                                        {asset.ram_gb} GB
                                    </td>

                                    <td className="numeric-cell">
                                        {
                                            asset.software_count
                                        }
                                    </td>

                                    <td className="numeric-cell">
                                        <div
                                            className={`vulnerability-count ${
                                                asset.has_critical_vuln
                                                    ? 'has-critical'
                                                    : ''
                                            }`}
                                        >
                                            {asset.has_critical_vuln ? (
                                                <AlertTriangle
                                                    size={14}
                                                />
                                            ) : (
                                                <ShieldCheck
                                                    size={14}
                                                />
                                            )}

                                            {asset.vuln_count}
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${getPatchClass(
                                                asset.patch_status
                                            )}`}
                                        >
                                            {
                                                asset.patch_status
                                            }
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {assets.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="empty-state"
                                    >
                                        <div className="empty-state-content">
                                            <Search
                                                size={20}
                                            />

                                            <strong>
                                                No assets
                                                found
                                            </strong>

                                            <span>
                                                Try adjusting
                                                your search.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="pagination">
                <span>
                    Page{' '}
                    <strong>{currentPage}</strong>{' '}
                    of{' '}
                    <strong>{lastPage}</strong>
                </span>

                <div className="pagination-buttons">
                    <button
                        type="button"
                        disabled={
                            currentPage === 1 || loading
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) => page - 1
                            )
                        }
                    >
                        <ChevronLeft size={15} />
                        Previous
                    </button>

                    <button
                        type="button"
                        disabled={
                            currentPage === lastPage ||
                            loading
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) => page + 1
                            )
                        }
                    >
                        Next
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Assets;