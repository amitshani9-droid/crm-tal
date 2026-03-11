import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck } from 'lucide-react';

function Sidebar({ profile, session }) {
    const navigate = useNavigate();
    const location = useLocation();
    const logoUrl = profile?.settings?.logo_url;
    const isMasterAdmin = session?.user?.email?.toLowerCase() === 'amitshani9@gmail.com';
    
    const menuItems = [
        { id: 'dashboard', path: '/dashboard', label: 'לוח לידים', icon: '📊' },
        { id: 'analytics', path: '/analytics', label: 'דוחות ואנליטיקה', icon: '📈' },
        { id: 'settings', path: '/settings', label: 'הגדרות', icon: '⚙️' },
        { id: 'join', label: 'קישור לדף נחיתה', icon: '🔗', isExternal: true },
        { id: 'logout', label: 'התנתקות', icon: '🚪', isAction: true }
    ];

    if (isMasterAdmin) {
        menuItems.push({ 
            id: 'admin', 
            path: '/admin',
            label: 'ניהול מערכת (Admin)', 
            icon: <ShieldCheck size={18} color="#f59e0b" style={{ verticalAlign: 'middle', marginTop: '-2px' }} />, 
            isRoute: true 
        });
    }

    const handleItemClick = async (item) => {
        if (item.id === 'logout') {
            localStorage.removeItem('crm_business_name');
            await supabase.auth.signOut();
            navigate('/login', { replace: true });
        } else if (item.isExternal) {
            const slug = profile?.slug || '';
            window.open(slug ? `${window.location.origin}/טופס/${slug}` : `${window.location.origin}/טופס`, '_blank');
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
                ) : (
                    <h2>AS-<span>CRM</span></h2>
                )}
            </div>
            <ul className="nav-links">
                {menuItems.map(item => {
                    const isActive = item.path && location.pathname.startsWith(item.path);
                    return (
                        <li
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleItemClick(item)}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}

export default Sidebar;
