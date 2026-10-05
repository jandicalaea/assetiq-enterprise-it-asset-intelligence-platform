import { useCallback, useEffect, useMemo, useState } from 'react';
import { Monitor, Package, Search } from 'lucide-react';

import { getOverview } from '../api/analytics';
import { getAssets, getAssetSoftware } from '../api/assets';
import { ErrorState, PageSkeleton } from './UiStates';

function Software() {
    const [assets, setAssets] = useState([]);
    const [software, setSoftware] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [search, setSearch] = useState('');
    const [assetsLoading, setAssetsLoading] = useState(true);
    const [softwareLoading, setSoftwareLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadAssets = useCallback(async () => {
        setAssetsLoading(true);
        setError(null);

        try {
            const overview = await getOverview();
            const data = await getAssets(1, overview.total_assets);
            const records = data.data || [];

            setAssets(records);
            setSelectedAsset((current) => current || records[0]?.pc_name || '');
        } catch (requestError) {
            console.error(requestError);
            setError('The endpoint list could not be retrieved.');
        } finally {
            setAssetsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    useEffect(() => {
        if (!selectedAsset) return;

        let active = true;

        const loadSoftware = async () => {
            setSoftwareLoading(true);
            setError(null);
            setSoftware([]);

            try {
                const data = await getAssetSoftware(selectedAsset);

                if (active) {
                    setSoftware(data.data || []);
                }
            } catch (requestError) {
                console.error(requestError);

                if (active) {
                    setError('The software inventory for this endpoint could not be retrieved.');
                }
            } finally {
                if (active) {
                    setSoftwareLoading(false);
                }
            }
        };

        loadSoftware();

        return () => {
            active = false;
        };
    }, [selectedAsset]);

    const filteredSoftware = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return software;

        return software.filter((item) =>
            [item.name, item.version, item.category]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query)
        );
    }, [software, search]);

    const selectedAssetRecord = assets.find(
        (asset) => asset.pc_name === selectedAsset
    );

    if (assetsLoading) {
        return <PageSkeleton cards={0} rows={8} />;
    }

    if (error && !selectedAsset) {
        return (
            <ErrorState
                title="Unable to load software inventory"
                message={error}
                onRetry={loadAssets}
            />
        );
    }

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">SOFTWARE INTELLIGENCE</p>
                    <h2>Software Inventory</h2>
                    <p>
                        Review installed applications by managed enterprise endpoint.
                    </p>
                </div>

                <div className="asset-total">
                    <Package size={16} />
                    {softwareLoading
                        ? 'Loading Inventory'
                        : `${software.length.toLocaleString()} Applications`}
                </div>
            </div>

            <div className="software-context-card">
                <div className="software-context-icon" aria-hidden="true">
                    <Monitor size={18} />
                </div>
                <div>
                    <span>Selected Endpoint</span>
                    <strong>{selectedAsset || 'No endpoint selected'}</strong>
                    <small>
                        {selectedAssetRecord
                            ? `${selectedAssetRecord.department} · ${selectedAssetRecord.os_name}`
                            : 'Select an endpoint to inspect its software inventory.'}
                    </small>
                </div>
            </div>

            <div className="asset-toolbar software-toolbar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="search"
                        aria-label="Search software on selected endpoint"
                        placeholder="Search software, version, or category..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <label className="select-field">
                    <span>Endpoint</span>
                    <select
                        value={selectedAsset}
                        onChange={(event) => {
                            setSelectedAsset(event.target.value);
                            setSearch('');
                        }}
                    >
                        {assets.map((asset) => (
                            <option key={asset.id} value={asset.pc_name}>
                                {asset.pc_name} — {asset.department}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {error && (
                <div className="inline-error" role="alert">
                    <span>{error}</span>
                </div>
            )}

            <div className={`asset-table-card ${softwareLoading ? 'is-loading' : ''}`}>
                <div className="table-scroll">
                    <table className="asset-table">
                        <thead>
                            <tr>
                                <th>Software</th>
                                <th>Version</th>
                                <th>Category</th>
                                <th>Asset</th>
                            </tr>
                        </thead>

                        <tbody>
                            {softwareLoading && (
                                <tr>
                                    <td colSpan="4" className="table-loading-cell">
                                        Loading software inventory…
                                    </td>
                                </tr>
                            )}

                            {!softwareLoading &&
                                filteredSoftware.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="asset-name">
                                                <div className="asset-icon" aria-hidden="true">
                                                    <Package size={15} />
                                                </div>
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span>Application record</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.version || 'N/A'}</td>
                                        <td>
                                            <span className="status-badge badge-neutral">
                                                {item.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td>{item.pc_name || selectedAsset}</td>
                                    </tr>
                                ))}

                            {!softwareLoading && filteredSoftware.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        <div className="empty-state-content">
                                            <Package size={20} />
                                            <strong>No software records found</strong>
                                            <span>
                                                {search
                                                    ? 'Try adjusting your search.'
                                                    : 'No software inventory was returned for this endpoint.'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Software;
