import React, { useState } from 'react';
import './LoginPage.css';

// Hardcoded Password - easy to change here
const MASTER_PASSWORD = "Tal2026";

export default function LoginPage({ onLoginSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate slight delay for premium feel
        setTimeout(() => {
            if (password === MASTER_PASSWORD) {
                setError(false);
                // Store session in localStorage so user stays logged in
                localStorage.setItem('crm_auth_token', 'authenticated');
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
