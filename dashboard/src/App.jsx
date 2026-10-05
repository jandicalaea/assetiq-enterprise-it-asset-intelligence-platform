import './App.css';

import { useAuth } from './context/AuthContext';
import AuthProvider from './context/AuthProvider';
import AppLayout from './components/AppLayout';
import LoginPage from './components/LoginPage';

function AuthLoadingScreen() {
    return (
        <div className="auth-loading-screen" role="status" aria-live="polite">
            <div className="auth-loading-mark">
                <span />
            </div>
            <strong>AssetIQ</strong>
            <p>Verifying secure session...</p>
        </div>
    );
}

function AppContent() {
    const { user, initializing } = useAuth();

    if (initializing) {
        return <AuthLoadingScreen />;
    }

    return user ? <AppLayout /> : <LoginPage />;
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
