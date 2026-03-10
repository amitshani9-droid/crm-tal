import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

export default function LoginPage({ initialIsSignUp = false }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const cleanEmail = email.trim().toLowerCase();

        try {
            if (isSignUp) {
                const slug = businessName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0590-\u05FF-]/g, '');
                const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            business_name: businessName,
                            slug: slug
                        },
                        emailRedirectTo: window.location.origin,
                    }
                });
                if (error) {
                    if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
                        throw new Error('נרשמו יותר מדי משתמשים בזמן קצר. אנא נסו שוב בעוד כמה דקות או פנו לעמית לתמיכה.');
                    }
                    throw error;
                }
                
                // If user is immediately logged in (email confirmation disabled), embed their profile
                if (data?.session || data?.user) {
                    const profileData = {
                        id: data.user.id,
                        business_name: businessName,
                        slug: slug,
                        is_approved: false, // Explicitly enforce approval block
                        settings: {
                            brand_color: '#1e40af',
                            logo_url: '',
                            custom_statuses: ["חדש", "בטיפול", "נשלחה הצעת מחיר", "סגור"],
                            business_description: ''
                        }
                    };
                    await supabase.from('profiles').upsert(profileData);
                }
                // App.jsx will automatically detect the active session and route them to /dashboard
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password,
                });
                if (error) throw error;
            }
        } catch (err) {
            // 1. Debugging: Log the EXACT error object so we can read 'message' and 'status'
            console.error('Supabase Auth Error:', err, { message: err.message, status: err.status });
            
            // 2. Handling precise Supabase errors
            if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
                setError('יש לאשר את המייל כדי להתחבר. בדקו את תיבת הדואר שלכם או בטלו את אימות המייל בהגדרות Supabase.');
            } else if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
                setError(`פרטי ההתחברות ל-${cleanEmail} לא נכונים. או שהסיסמה שגויה, או שהמייל עדיין לא אושר.`);
            } else {
                setError(err.message || 'חלה שגיאה בתהליך. אנא נסי שוב.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Background Decorations */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
            <div className="bg-blob blob-3"></div>
            
            <div className="glass-card login-card">
                <div className="login-header">
                    <div className="login-avatar-wrapper">
                        <div className="user-avatar-large">
                            <span className="avatar-icon">✨</span>
                        </div>
                    </div>
                    <h1>{isSignUp ? 'הרשמה ל-AS-CRM' : 'ברוכים הבאים ל-AS-CRM'}</h1>
                    <p className="subtitle">{isSignUp ? 'צרו חשבון חדש והתחילו לנהל לידים' : 'הקלידו פרטי גישה למערכת'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isSignUp && (
                        <div className="form-group">
                            <div className="input-wrapper">
                                <span className="input-icon">🏢</span>
                                <input
                                    type="text"
                                    placeholder="שם העסק"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required={isSignUp}
                                />
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                placeholder="אימייל"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                placeholder="סיסמה"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                required
                            />
                        </div>
                        {error && <span className="error-message">{error}</span>}
                        {message && <span className="success-message">{message}</span>}
                    </div>

                    <button type="submit" className="btn-primary login-btn" disabled={loading || !password || !email || (isSignUp && !businessName)}>
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
                        ) : (isSignUp ? "התחל עכשיו" : "התחברות")}
                    </button>
                    
                    <div className="login-footer">
                        <p>{isSignUp ? 'כבר יש לך חשבון?' : 'עוד לא רשומים?'}</p>
                        <button 
                            type="button" 
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="toggle-btn"
                        >
                            {isSignUp ? 'התחברו כאן' : 'צרו חשבון חדש'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
