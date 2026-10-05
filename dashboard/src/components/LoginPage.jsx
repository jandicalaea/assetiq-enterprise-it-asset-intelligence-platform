import { useState } from 'react';
import {
    Database,
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Monitor,
    ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

function getLoginError(error) {
    const validationMessage = error.response?.data?.errors?.email?.[0];

    if (validationMessage) {
        return validationMessage;
    }

    if (error.response?.status === 419) {
        return 'The secure login session expired. Please try again.';
    }

    if (error.response?.status === 429) {
        return 'Too many login attempts. Please wait a minute and try again.';
    }

    if (error.response?.data?.message && error.response.status !== 500) {
        return error.response.data.message;
    }

    if (!error.response) {
        return 'Unable to reach the AssetIQ API. Confirm the Laravel server is running.';
    }

    return 'Unable to sign in right now. Please try again.';
}

function LoginPage() {
    const { login, authError, clearAuthError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');
        clearAuthError();
        setSubmitting(true);

        try {
            await login({
                email: email.trim(),
                password,
            });
        } catch (error) {
            setFormError(getLoginError(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <section className="auth-brand-panel" aria-label="AssetIQ platform">
                <div className="auth-brand-lockup">
                    <div className="auth-brand-mark">
                        <Monitor size={23} />
                    </div>
                    <div>
                        <strong>AssetIQ</strong>
                        <span>IT Intelligence Platform</span>
                    </div>
                </div>

                <div className="auth-brand-content">
                    <p className="auth-kicker">ENTERPRISE IT OPERATIONS</p>
                    <h1>Infrastructure intelligence in one secure workspace.</h1>
                    <p>
                        Monitor enterprise assets, security findings, software inventory,
                        patch posture, and infrastructure analytics through a protected
                        operational console.
                    </p>

                    <div className="auth-capabilities">
                        <div>
                            <ShieldCheck size={17} />
                            <span>Security posture visibility</span>
                        </div>
                        <div>
                            <Database size={17} />
                            <span>Centralized asset intelligence</span>
                        </div>
                        <div>
                            <LockKeyhole size={17} />
                            <span>Laravel Sanctum session security</span>
                        </div>
                    </div>
                </div>

                <div className="auth-brand-footer">
                    AssetIQ Enterprise IT Asset Intelligence Platform
                </div>
            </section>

            <main className="auth-form-panel">
                <div className="auth-form-shell">
                    <div className="auth-form-heading">
                        <p className="eyebrow">SECURE ACCESS</p>
                        <h2>Sign in to AssetIQ</h2>
                        <p>Use your authorized AssetIQ account to continue.</p>
                    </div>

                    {(formError || authError) && (
                        <div className="auth-error" role="alert">
                            <ShieldCheck size={17} />
                            <span>{formError || authError}</span>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="auth-field">
                            <span>Email address</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                placeholder="name@company.com"
                                required
                                disabled={submitting}
                            />
                        </label>

                        <label className="auth-field">
                            <span>Password</span>
                            <div className="password-field">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    required
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((value) => !value)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={submitting || !email.trim() || !password}
                        >
                            {submitting ? (
                                <>
                                    <LoaderCircle className="spin" size={17} />
                                    Signing in
                                </>
                            ) : (
                                <>
                                    <LockKeyhole size={17} />
                                    Sign in
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-session-note">
                        <LockKeyhole size={15} />
                        <p>
                            AssetIQ uses a server-side Laravel session with Sanctum CSRF
                            protection. Credentials are not stored in the React client.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LoginPage;
