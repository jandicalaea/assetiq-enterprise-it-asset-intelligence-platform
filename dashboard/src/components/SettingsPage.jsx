import { useEffect, useState } from 'react';
import {
    Accessibility,
    Database,
    Gauge,
    Info,
    LockKeyhole,
    RotateCcw,
    Server,
    SlidersHorizontal,
    UserRound,
} from 'lucide-react';

import { API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DENSITY_KEY = 'assetiq-table-density';
const REDUCE_MOTION_KEY = 'assetiq-reduce-motion';

function getStoredDensity() {
    const stored = window.localStorage.getItem(DENSITY_KEY);
    return stored === 'compact' ? 'compact' : 'comfortable';
}

function getStoredReduceMotion() {
    return window.localStorage.getItem(REDUCE_MOTION_KEY) === 'true';
}

function SettingsPage() {
    const { user } = useAuth();
    const [density, setDensity] = useState(getStoredDensity);
    const [reduceMotion, setReduceMotion] = useState(getStoredReduceMotion);

    useEffect(() => {
        document.documentElement.dataset.density = density;
        window.localStorage.setItem(DENSITY_KEY, density);
    }, [density]);

    useEffect(() => {
        document.documentElement.dataset.reduceMotion = String(reduceMotion);
        window.localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
    }, [reduceMotion]);

    const resetPreferences = () => {
        setDensity('comfortable');
        setReduceMotion(false);
    };

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">SYSTEM PREFERENCES</p>
                    <h2>Settings</h2>
                    <p>
                        Configure browser-local interface preferences and review the current
                        AssetIQ application environment.
                    </p>
                </div>

                <span className="settings-local-chip">Stored in this browser</span>
            </div>

            <div className="settings-layout">
                <div className="settings-column">
                    <section className="settings-card" aria-labelledby="appearance-heading">
                        <div className="settings-card-header">
                            <div className="settings-card-icon">
                                <SlidersHorizontal size={18} />
                            </div>
                            <div>
                                <p className="eyebrow">INTERFACE</p>
                                <h3 id="appearance-heading">Appearance & Density</h3>
                                <p>Preferences here affect only this browser.</p>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-row-copy">
                                <div className="settings-row-title">
                                    <Gauge size={16} />
                                    <strong>Table density</strong>
                                </div>
                                <p>
                                    Choose between comfortable scanning and a denser operational
                                    table layout.
                                </p>
                            </div>

                            <div className="segmented-control" aria-label="Table density">
                                <button
                                    type="button"
                                    className={density === 'comfortable' ? 'active' : ''}
                                    aria-pressed={density === 'comfortable'}
                                    onClick={() => setDensity('comfortable')}
                                >
                                    Comfortable
                                </button>
                                <button
                                    type="button"
                                    className={density === 'compact' ? 'active' : ''}
                                    aria-pressed={density === 'compact'}
                                    onClick={() => setDensity('compact')}
                                >
                                    Compact
                                </button>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-row-copy">
                                <div className="settings-row-title">
                                    <Accessibility size={16} />
                                    <strong>Reduce motion</strong>
                                </div>
                                <p>
                                    Disable non-essential transitions in addition to your operating
                                    system&apos;s reduced-motion preference.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={`toggle-switch ${reduceMotion ? 'is-on' : ''}`}
                                role="switch"
                                aria-checked={reduceMotion}
                                aria-label="Reduce motion"
                                onClick={() => setReduceMotion((value) => !value)}
                            >
                                <span />
                            </button>
                        </div>

                        <div className="settings-card-footer">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={resetPreferences}
                            >
                                <RotateCcw size={15} />
                                Reset local preferences
                            </button>
                        </div>
                    </section>

                    <section className="settings-card" aria-labelledby="security-settings-heading">
                        <div className="settings-card-header">
                            <div className="settings-card-icon">
                                <LockKeyhole size={18} />
                            </div>
                            <div>
                                <p className="eyebrow">ACCESS CONTROL</p>
                                <h3 id="security-settings-heading">Authentication</h3>
                                <p>Current secure access configuration for this AssetIQ session.</p>
                            </div>
                        </div>

                        <div className="settings-row settings-row-static">
                            <div className="settings-row-copy">
                                <strong>Laravel Sanctum</strong>
                                <p>
                                    The React client is authenticated using Laravel&apos;s
                                    first-party SPA session and CSRF protection.
                                </p>
                            </div>
                            <span className="status-badge badge-success">Active</span>
                        </div>

                        <div className="settings-auth-user">
                            <div className="settings-auth-user-icon">
                                <UserRound size={17} />
                            </div>
                            <div>
                                <span>Signed in as</span>
                                <strong>{user?.name || 'Authenticated user'}</strong>
                                <small>{user?.email || 'Session account'}</small>
                            </div>
                        </div>

                        <div className="settings-notice settings-notice-success">
                            Protected AssetIQ API resources require the authenticated Sanctum
                            session. Credentials are validated by Laravel rather than stored in
                            browser-local application state.
                        </div>
                    </section>
                </div>

                <div className="settings-column">
                    <section className="settings-card" aria-labelledby="environment-heading">
                        <div className="settings-card-header">
                            <div className="settings-card-icon">
                                <Server size={18} />
                            </div>
                            <div>
                                <p className="eyebrow">ENVIRONMENT</p>
                                <h3 id="environment-heading">API Configuration</h3>
                                <p>Current frontend connection target.</p>
                            </div>
                        </div>

                        <dl className="settings-definition-list">
                            <div>
                                <dt>API client</dt>
                                <dd>Axios</dd>
                            </div>
                            <div>
                                <dt>Base URL</dt>
                                <dd>
                                    <code>{API_BASE_URL}</code>
                                </dd>
                            </div>
                            <div>
                                <dt>Transport</dt>
                                <dd>REST / JSON</dd>
                            </div>
                            <div>
                                <dt>Frontend authentication</dt>
                                <dd>Laravel Sanctum session</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="settings-card" aria-labelledby="about-heading">
                        <div className="settings-card-header">
                            <div className="settings-card-icon">
                                <Info size={18} />
                            </div>
                            <div>
                                <p className="eyebrow">ABOUT</p>
                                <h3 id="about-heading">AssetIQ</h3>
                                <p>Enterprise IT Asset Intelligence Platform</p>
                            </div>
                        </div>

                        <div className="about-stack">
                            <div className="about-stack-item">
                                <Database size={16} />
                                <div>
                                    <strong>Data platform</strong>
                                    <span>MySQL / MariaDB through Laravel REST APIs</span>
                                </div>
                            </div>
                            <div className="about-stack-item">
                                <SlidersHorizontal size={16} />
                                <div>
                                    <strong>Frontend</strong>
                                    <span>React, Vite, Axios, Recharts, and Lucide</span>
                                </div>
                            </div>
                            <div className="about-stack-item">
                                <LockKeyhole size={16} />
                                <div>
                                    <strong>Access security</strong>
                                    <span>Sanctum SPA authentication with protected API access</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
