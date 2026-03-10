import React, { useState } from 'react';
import './LoginPage.css';

// Password is sourced from .env.local (VITE_ADMIN_PASSWORD)
// Settings.jsx can override it at runtime via localStorage.
const ENV_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function LoginPage({ onLoginSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Prefer runtime override from Settings; fall back to build-time env variable.
        const savedPassword = localStorage.getItem('crm_master_password') || ENV_PASSWORD;

        // Simulate slight delay for premium feel
        setTimeout(() => {
            if (password === savedPassword) {
                setError(false);
                // Store a unique session token + 24h expiry so a static string can't be forged
                const token = crypto.randomUUID();
                const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
                localStorage.setItem('crm_auth_token', token);
                localStorage.setItem('crm_auth_expiry', String(expiry));
                onLoginSuccess();
            } else {
                setError(true);
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div className="login-container">
            <div className="glass-card login-card">
                <div className="login-header">
                    <div className="login-avatar-wrapper">
                        <div className="user-avatar-large"></div>
                    </div>
                    <h1>שלום טל, התחברי לניהול האירועים שלך</h1>
                    <p>הקלידי את סיסמת הגישה למערכת</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="סיסמה"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(false);
                            }}
                            className={error ? 'input-error' : ''}
                            autoFocus
                        />
                        {error && <span className="error-message">סיסמה שגויה, נסי שוב</span>}
                    </div>

                    <button type="submit" className="btn-primary login-btn" disabled={loading || !password}>
                        {loading ? (
                            <span className="spin-animation">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                            </span>
                        ) : "התחברות"}
                    </button>
                </form>
            </div>
        </div>
    );
}
