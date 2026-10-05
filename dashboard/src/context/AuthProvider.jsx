import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, signIn, signOut } from '../api/auth';
import { AuthContext } from './AuthContext';

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [authError, setAuthError] = useState('');

    const restoreSession = useCallback(async () => {
        setAuthError('');

        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);

            if (error.response?.status !== 401) {
                setAuthError(
                    'AssetIQ could not reach the authentication service. Confirm the Laravel server is running.'
                );
            }
        } finally {
            setInitializing(false);
        }
    }, []);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            setInitializing(false);
        };

        window.addEventListener('assetiq:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('assetiq:unauthorized', handleUnauthorized);
        };
    }, []);

    const login = useCallback(async (credentials) => {
        setAuthError('');

        try {
            const authenticatedUser = await signIn(credentials);
            setUser(authenticatedUser);
            return authenticatedUser;
        } catch (error) {
            if (!error.response) {
                setAuthError(
                    'Unable to reach the AssetIQ API. Confirm the Laravel server is running on localhost:8000.'
                );
            }

            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        setAuthError('');

        try {
            await signOut();
            setUser(null);
        } catch (error) {
            if (error.response?.status === 401) {
                setUser(null);
                return;
            }

            throw error;
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            initializing,
            authError,
            login,
            logout,
            restoreSession,
            clearAuthError: () => setAuthError(''),
        }),
        [user, initializing, authError, login, logout, restoreSession]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
