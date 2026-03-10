import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageCircle, CheckCircle, XCircle, Users, Activity, Clock, ShieldCheck, DollarSign, LogOut, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ session }) {
    const [profiles, setProfiles] = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);
    const [averageDormancy, setAverageDormancy] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (session?.user?.email?.toLowerCase() === 'amitshani9@gmail.com') {
            fetchDashboardData();
        } else {
            setLoading(false);
            navigate('/dashboard', { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Explicitly pass JWT token for the Edge Function authorization
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const { data: profilesData, error: profilesError } = await supabase.functions.invoke('admin-get-all-profiles', {
                headers: {
                    Authorization: `Bearer ${currentSession?.access_token}`
                }
            });
                
            if (profilesError) {
                if (profilesError.message?.includes('Unauthorized') || profilesError.status === 401) {
                    console.warn("Access Denied: Redirecting unauthorized user to dashboard.");
                    alert("גישה מוגבלת למנהל המערכת בלבד.");
                    navigate('/dashboard', { replace: true });
                    return;
                }
                throw profilesError;
            }
            
            // console.log("Admin Access Verified: Data fetched from Edge Function.");
            setProfiles(profilesData || []);

            // Fetch total leads count across entire system
            const { data: leadsData, error: leadsError } = await supabase
                .from('clients')
                .select('last_interaction, created_at');
                
            if (!leadsError && leadsData) {
                setTotalLeads(leadsData.length);
                
                // Calculate average dormancy
                const now = new Date();
                let totalDays = 0;
                leadsData.forEach(lead => {
                    const lastIter = new Date(lead.last_interaction || lead.created_at || now);
                    const diffDays = Math.floor((now - lastIter) / (1000 * 60 * 60 * 24));
                    totalDays += diffDays;
                });
                const avg = leadsData.length > 0 ? (totalDays / leadsData.length).toFixed(1) : 0;
                setAverageDormancy(avg);
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
            alert('שגיאה בטעינת נתוני מנהל.');
        } finally {
            setLoading(false);
        }
    };

    const toggleApprovalStatus = async (profile) => {
        const newStatus = !profile.is_approved;
        
        // Optimistic UI update
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_approved: newStatus } : p));
        
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: newStatus })
                .eq('id', profile.id);
                
            if (error) {
                setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_approved: profile.is_approved } : p));
                throw error;
            }
        } catch (error) {
            console.error('Error updating approval status:', error);
            alert('Failed to update approval status.');
        }
    };

    const togglePaymentStatus = async (profile, fieldName) => {
        const currentSettings = profile.settings || {};
        const newStatus = !currentSettings[fieldName];
        const updatedSettings = { ...currentSettings, [fieldName]: newStatus };
        
        // Optimistic update
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, settings: updatedSettings } : p));
        
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ settings: updatedSettings })
                .eq('id', profile.id);
                
            if (error) {
                setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, settings: currentSettings } : p));
                throw error;
            }
        } catch (error) {
            console.error(`Error updating ${fieldName}:`, error);
        }
    };

    const updateAiLimit = async (profile, newLimit) => {
        const currentSettings = profile.settings || {};
        const updatedSettings = { ...currentSettings, ai_monthly_limit: parseInt(newLimit, 10) || 50 };

        // Optimistic update
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, settings: updatedSettings } : p));

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ settings: updatedSettings })
                .eq('id', profile.id);

            if (error) {
                setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, settings: currentSettings } : p));
                throw error;
            }
        } catch (error) {
            console.error('Error updating AI limit:', error);
        }
    };

    const sendServiceMessage = (profile) => {
        const phone = prompt(`אנא הכנס/י מספר טלפון לשליחת הודעה ל-${profile.business_name}:`);
        if (!phone) return;
        
        const cleanPhoneRaw = phone.replace(/[^\d]/g, '');
        let cleanPhone = cleanPhoneRaw;
        if (cleanPhone.startsWith('972')) cleanPhone = cleanPhone.substring(3);
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        const msg = "היי, ראיתי שנרשמת ל-AS-CRM. אשמח להסדיר תשלום ולהפעיל לך את החשבון.";
        window.open(`https://wa.me/972${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const pendingCount = profiles.filter(p => !p.is_approved).length;

    const handleLogout = async () => {
        localStorage.removeItem('crm_business_name');
        await supabase.auth.signOut();
        navigate('/', { replace: true });
    };

    if (loading) return <div className="placeholder-view">טוען נתוני אדמין מורחבים...</div>;

    return (
        <div style={{ padding: '60px 40px', direction: 'rtl', fontFamily: 'inherit', maxWidth: '1600px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ShieldCheck size={40} color="#f59e0b" />
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>ניהול מערכת (Master Admin)</h2>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'linear-gradient(135deg, #d97706, #ca8a04)',
                            color: 'white',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        חזרה לדשבורד לקוחות
                        <ArrowRight size={20} />
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'transparent',
                            color: '#ef4444',
                            border: '2px solid #fee2e2',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '1rem'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                    >
                        <LogOut size={20} />
                        התנתק
                    </button>
                </div>
            </div>
            
            {/* STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '30px', borderTop: '4px solid #4f46e5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 10px 0' }}>סך הכל משתמשים בענן</p>
                            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{profiles.length}</h3>
                        </div>
                        <div style={{ backgroundColor: '#eef2ff', padding: '16px', borderRadius: '16px', color: '#4f46e5' }}>
                            <Users size={32} />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '30px', borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 10px 0' }}>לידים שנוצרו במערכת (גלובלי)</p>
                            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{totalLeads}</h3>
                        </div>
                        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', color: '#10b981' }}>
                            <Activity size={32} />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '30px', borderTop: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 10px 0' }}>ממתינים לאישור והפעלה</p>
                            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{pendingCount}</h3>
                        </div>
                        <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '16px', color: '#d97706' }}>
                            <Clock size={32} />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '30px', borderTop: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 10px 0' }}>זמן תרדמה ממוצע (מערכתי)</p>
                            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{averageDormancy} <span style={{fontSize: '1rem', color: '#64748b'}}>ימים</span></h3>
                        </div>
                        <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', color: '#ef4444' }}>
                            <Clock size={32} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* USER MANAGEMENT TABLE */}
            <div className="glass-card" style={{ padding: '0', overflowX: 'auto', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '1000px' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569' }}>שם העסק</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569' }}>תאריך הצטרפות</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569' }}>סטטוס מערכת</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>שולם הקמה (₪1899)</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>מנוי חודשי פעיל</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>מכסת AI</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>שימוש AI</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>פעולות אדמין</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map(profile => (
                            <tr key={profile.id} className="admin-table-row">
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{profile.business_name || 'ללא שם'}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>as-crm.vercel.app/טופס/{profile.slug}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px', fontFamily: 'monospace' }}>{profile.id.substring(0,8)}... (מזהה ענן)</div>
                                </td>
                                <td style={{ padding: '20px 24px', color: '#475569', fontWeight: 500 }}>
                                    {new Date(profile.created_at).toLocaleDateString('he-IL')}
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <button 
                                        onClick={() => toggleApprovalStatus(profile)}
                                        style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                            background: profile.is_approved ? '#f0fdf4' : '#fef2f2', 
                                            color: profile.is_approved ? '#16a34a' : '#ef4444', 
                                            padding: '8px 16px', borderRadius: '50px', border: `1px solid ${profile.is_approved ? '#bbf7d0' : '#fecaca'}`, cursor: 'pointer', fontWeight: 700, transition: '0.2s' 
                                        }}
                                    >
                                        {profile.is_approved ? <><CheckCircle size={16} /> עובד ופעיל</> : <><XCircle size={16} /> ממתין לאישור</>}
                                    </button>
                                </td>
                                
                                {/* Setup Paid Toggle */}
                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                    <label style={{ display: 'inline-flex', cursor: 'pointer', alignItems: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={!!profile.settings?.setup_paid} 
                                            onChange={() => togglePaymentStatus(profile, 'setup_paid')}
                                            style={{ width: '20px', height: '20px', accentColor: '#4f46e5', cursor: 'pointer' }}
                                        />
                                    </label>
                                </td>
                                
                                {/* Monthly Active Toggle */}
                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                    <label style={{ display: 'inline-flex', cursor: 'pointer', alignItems: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={!!profile.settings?.monthly_active} 
                                            onChange={() => togglePaymentStatus(profile, 'monthly_active')}
                                            style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                                        />
                                    </label>
                                </td>
                                
                                {/* AI Limit Editable Column */}
                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                    <input 
                                        type="number" 
                                        value={profile.settings?.ai_monthly_limit || 50} 
                                        onChange={(e) => updateAiLimit(profile, e.target.value)}
                                        style={{ 
                                            width: '60px', 
                                            padding: '8px', 
                                            textAlign: 'center', 
                                            borderRadius: '8px', 
                                            border: '1px solid #e2e8f0',
                                            fontWeight: 'bold',
                                            color: '#d946ef'
                                        }} 
                                    />
                                </td>

                                {/* AI Usage (View Only) */}
                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                    <div style={{ 
                                        fontWeight: 600, 
                                        color: (profile.settings?.ai_usage_count || 0) >= (profile.settings?.ai_monthly_limit || 50) ? '#ef4444' : '#64748b' 
                                    }}>
                                        {profile.settings?.ai_usage_count || 0}
                                    </div>
                                </td>

                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => sendServiceMessage(profile)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, transition: '0.2s', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.2)' }}
                                    >
                                        <MessageCircle size={18} /> וואטסאפ בעלים
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {profiles.length === 0 && (
                            <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', opacity: 0.5, fontSize: '1.2rem' }}>אין עסקים רשומים במערכת עדיין...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
