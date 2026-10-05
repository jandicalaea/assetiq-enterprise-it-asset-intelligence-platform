import { useEffect, useMemo, useRef, useState } from 'react';
import {
    BarChart3,
    ChevronDown,
    ChevronRight,
    Database,
    LayoutDashboard,
    LogOut,
    Menu,
    Monitor,
    Package,
    Settings,
    ShieldCheck,
    UserRound,
    X,
} from 'lucide-react';

import { getOverview } from '../api/analytics';
import { useAuth } from '../context/AuthContext';
import Analytics from './Analytics';
import Assets from './Assets';
import Dashboard from './Dashboard';
import DataSources from './DataSources';
import Security from './Security';
import SettingsPage from './SettingsPage';
import Software from './Software';

const navigation = [
    { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { label: 'Assets', icon: Monitor, page: 'assets' },
    { label: 'Security', icon: ShieldCheck, page: 'security' },
    { label: 'Software', icon: Package, page: 'software' },
    { label: 'Analytics', icon: BarChart3, page: 'analytics' },
];

const pageMeta = {
    dashboard: {
        section: 'Workspace',
        breadcrumb: 'Overview',
        title: 'Enterprise IT Dashboard',
    },
    assets: {
        section: 'Workspace',
        breadcrumb: 'Assets',
        title: 'Asset Management',
    },
    security: {
        section: 'Workspace',
        breadcrumb: 'Security',
        title: 'Security Operations',
    },
    software: {
        section: 'Workspace',
        breadcrumb: 'Software',
        title: 'Software Intelligence',
    },
    analytics: {
        section: 'Workspace',
        breadcrumb: 'Analytics',
        title: 'Enterprise Analytics',
    },
    dataSources: {
        section: 'System',
        breadcrumb: 'Data Sources',
        title: 'Data Sources',
    },
    settings: {
        section: 'System',
        breadcrumb: 'Settings',
        title: 'Settings',
    },
};

function getInitials(name = '') {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) return 'AI';

    return parts.map((part) => part[0].toUpperCase()).join('');
}

function AppLayout() {
    const { user, logout } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [assetCount, setAssetCount] = useState(null);
    const [apiConnected, setApiConnected] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutBusy, setLogoutBusy] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const profileRef = useRef(null);

    useEffect(() => {
        let active = true;

        const checkApi = async () => {
            try {
                const overview = await getOverview();

                if (active) {
                    setAssetCount(overview.total_assets);
                    setApiConnected(true);
                }
            } catch (error) {
                console.error(error);

                if (active) {
                    setApiConnected(false);
                }
            }
        };

        checkApi();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!profileOpen) return undefined;

        const handlePointerDown = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [profileOpen]);

    const currentMeta = pageMeta[activePage] || pageMeta.dashboard;

    const activeContent = useMemo(() => {
        switch (activePage) {
            case 'assets':
                return <Assets />;
            case 'security':
                return <Security />;
            case 'software':
                return <Software />;
            case 'analytics':
                return <Analytics />;
            case 'dataSources':
                return <DataSources />;
            case 'settings':
                return <SettingsPage />;
            case 'dashboard':
            default:
                return <Dashboard />;
        }
    }, [activePage]);

    const changePage = (page) => {
        setActivePage(page);
        setSidebarOpen(false);
        setProfileOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = async () => {
        setLogoutBusy(true);
        setLogoutError('');

        try {
            await logout();
        } catch (error) {
            console.error(error);
            setLogoutError('Unable to sign out. Confirm the Laravel API is reachable.');
        } finally {
            setLogoutBusy(false);
        }
    };

    return (
        <div className="app-shell">
            <aside
                className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
                aria-label="Primary navigation"
            >
                <div className="brand">
                    <div className="brand-mark" aria-hidden="true">
                        <Monitor size={21} />
                    </div>

                    <div className="brand-copy">
                        <div className="brand-name">AssetIQ</div>
                        <div className="brand-subtitle">IT Intelligence Platform</div>
                    </div>

                    <button
                        type="button"
                        className="sidebar-close"
                        aria-label="Close navigation"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">WORKSPACE</p>

                    <nav>
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePage === item.page;

                            return (
                                <button
                                    key={item.page}
                                    type="button"
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => changePage(item.page)}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>

                                    {item.page === 'assets' && assetCount !== null && (
                                        <span className="nav-count">
                                            {assetCount.toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">SYSTEM</p>

                    <nav>
                        <button
                            type="button"
                            className={`nav-item ${activePage === 'dataSources' ? 'active' : ''}`}
                            onClick={() => changePage('dataSources')}
                            aria-current={activePage === 'dataSources' ? 'page' : undefined}
                        >
                            <Database size={18} />
                            <span>Data Sources</span>
                        </button>

                        <button
                            type="button"
                            className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
                            onClick={() => changePage('settings')}
                            aria-current={activePage === 'settings' ? 'page' : undefined}
                        >
                            <Settings size={18} />
                            <span>Settings</span>
                        </button>
                    </nav>
                </div>

                <div className="sidebar-footer">
                    <div className="system-status">
                        <span
                            className={`status-dot ${
                                apiConnected === false ? 'status-dot-error' : ''
                            } ${apiConnected === null ? 'status-dot-pending' : ''}`}
                        />

                        <div>
                            <strong>
                                {apiConnected === true
                                    ? 'API Connected'
                                    : apiConnected === false
                                      ? 'API Unavailable'
                                      : 'Checking Connection'}
                            </strong>
                            <span>
                                {apiConnected === true
                                    ? 'Authenticated session active'
                                    : apiConnected === false
                                      ? 'Check backend server'
                                      : 'Verifying backend status'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="app-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="mobile-menu-button"
                            aria-label="Open navigation"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={19} />
                        </button>

                        <div>
                            <div className="breadcrumb" aria-label="Breadcrumb">
                                <span>{currentMeta.section || 'Workspace'}</span>
                                <ChevronRight size={13} />
                                <span>{currentMeta.breadcrumb}</span>
                            </div>
                            <h1>{currentMeta.title}</h1>
                        </div>
                    </div>

                    <div className="topbar-right">
                        <div
                            className={`connection-pill ${
                                apiConnected === false ? 'connection-pill-error' : ''
                            }`}
                        >
                            <span className="connection-dot" />
                            {apiConnected === true
                                ? 'API Connected'
                                : apiConnected === false
                                  ? 'API Offline'
                                  : 'Checking API'}
                        </div>

                        <div className="profile-menu-wrap" ref={profileRef}>
                            <button
                                type="button"
                                className={`profile-trigger ${profileOpen ? 'is-open' : ''}`}
                                aria-haspopup="menu"
                                aria-expanded={profileOpen}
                                onClick={() => {
                                    setProfileOpen((value) => !value);
                                    setLogoutError('');
                                }}
                            >
                                <span className="user-avatar" aria-hidden="true">
                                    {getInitials(user?.name)}
                                </span>
                                <span className="profile-trigger-copy">
                                    <strong>{user?.name || 'AssetIQ User'}</strong>
                                    <span>{user?.email || 'Authenticated session'}</span>
                                </span>
                                <ChevronDown size={15} />
                            </button>

                            {profileOpen && (
                                <div className="profile-dropdown" role="menu">
                                    <div className="profile-dropdown-header">
                                        <div className="profile-dropdown-icon">
                                            <UserRound size={17} />
                                        </div>
                                        <div>
                                            <strong>{user?.name}</strong>
                                            <span>{user?.email}</span>
                                        </div>
                                    </div>

                                    <div className="profile-session-row">
                                        <span className="status-dot" />
                                        <div>
                                            <strong>Secure session</strong>
                                            <span>Authenticated with Laravel Sanctum</span>
                                        </div>
                                    </div>

                                    {logoutError && (
                                        <p className="profile-error" role="alert">
                                            {logoutError}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        className="profile-logout"
                                        role="menuitem"
                                        onClick={handleLogout}
                                        disabled={logoutBusy}
                                    >
                                        <LogOut size={16} />
                                        {logoutBusy ? 'Signing out...' : 'Sign out'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="main-content">{activeContent}</main>
            </div>
        </div>
    );
}

export default AppLayout;
