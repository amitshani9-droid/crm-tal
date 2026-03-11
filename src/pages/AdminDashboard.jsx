import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageCircle, CheckCircle, XCircle, Users, Activity, Clock, ShieldCheck, LogOut, ArrowRight, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProAnalytics } from '../components/dashboard/ProAnalytics';

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
    }, [session, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Get fresh session to ensure latest JWT
            const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !freshSession) {
                console.error("No active session found");
                return;
            }

            const { data: profilesData, error: profilesError } = await supabase.functions.invoke('admin-get-all-profiles', {
                headers: { 
                    Authorization: `Bearer ${freshSession.access_token}`,
                    // Explicitly setting Content-Type can sometimes help with Edge Functions
                    'Content-Type': 'application/json'
                }
            });
                
            if (profilesError) {
                console.error("Edge Function Error:", profilesError);
                throw profilesError;
            }
            setProfiles(profilesData || []);

            const { data: leadsData, error: leadsError } = await supabase
                .from('clients')
                .select('last_interaction, created_at');
                
            if (!leadsError && leadsData) {
                setTotalLeads(leadsData.length);
                const now = new Date();
                let totalDays = 0;
                leadsData.forEach(lead => {
                    const lastIter = new Date(lead.last_interaction || lead.created_at || now);
                    totalDays += Math.floor((now - lastIter) / (1000 * 60 * 60 * 24));
                });
                setAverageDormancy(leadsData.length > 0 ? (totalDays / leadsData.length).toFixed(1) : 0);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleApprovalStatus = async (profile) => {
        const newStatus = !profile.is_approved;
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_approved: newStatus } : p));
        try {
            await supabase.from('profiles').update({ is_approved: newStatus }).eq('id', profile.id);
        } catch (error) {
            console.error('Error updating approval status:', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/', { replace: true });
    };

    if (loading) return <div className="placeholder-view">טוען נתוני אדמין...</div>;

    return (
        <div style={{ padding: '60px 40px', direction: 'rtl', maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ShieldCheck size={40} color="#f59e0b" />
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>ניהול מערכת (Master Admin)</h2>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                        חזרה לדשבורד <ArrowRight size={20} />
                    </button>
                    <button className="btn-secondary" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <LogOut size={20} /> התנתק
                    </button>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3>משתמשים: {profiles.length}</h3>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3>לידים: {totalLeads}</h3>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart2 size={24} color="var(--clr-primary)" /> ביצועים עסקיים (Your Account)
                </h3>
                <ProAnalytics />
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px' }}>שם העסק</th>
                            <th style={{ padding: '15px' }}>סטטוס</th>
                            <th style={{ padding: '15px' }}>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map(profile => (
                            <tr key={profile.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '15px' }}>{profile.business_name}</td>
                                <td style={{ padding: '15px' }}>
                                    <button 
                                        onClick={() => toggleApprovalStatus(profile)}
                                        className={profile.is_approved ? 'btn-active' : 'btn-inactive'}
                                        style={{ 
                                            padding: '5px 15px', 
                                            borderRadius: '20px', 
                                            background: profile.is_approved ? '#10b981' : '#64748b',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {profile.is_approved ? 'פעיל' : 'ממתין'}
                                    </button>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <button className="btn-secondary" onClick={() => {
                                        const msg = "היי, ראיתי שנרשמת ל-AS-CRM.";
                                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}>
                                        <MessageCircle size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
