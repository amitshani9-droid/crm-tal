import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, profile, session }) {
    const navigate = useNavigate();
    const logoUrl = profile?.settings?.logo_url;
    const isMasterAdmin = session?.user?.email?.toLowerCase() === 'amitshani9@gmail.com';
    
    const menuItems = [
        { id: 'dashboard', label: 'לוח לידים', icon: '📊' },
        { id: 'settings', label: 'הגדרות', icon: '⚙️' },
        { id: 'join', label: 'קישור לדף נחיתה', icon: '🔗', isExternal: true },
        { id: 'logout', label: 'התנתקות', icon: '🚪', isAction: true }
    ];

    if (isMasterAdmin) {
        menuItems.push({ 
            id: 'admin', 
            label: 'ניהול מערכת (Admin)', 
            icon: <ShieldCheck size={18} color="#f59e0b" style={{ verticalAlign: 'middle', marginTop: '-2px' }} />, 
            isRoute: true 
        });
    }

    const handleItemClick = async (item) => {
        if (item.id === 'logout') {
            localStorage.removeItem('crm_business_name');
            await supabase.auth.signOut();
        } else if (item.isExternal) {
            const slug = profile?.slug || '';
            window.open(slug ? `${window.location.origin}/טופס/${slug}` : `${window.location.origin}/טופס`, '_blank');
        } else if (item.isRoute) {
            navigate(`/${item.id}`);
        } else {
            setActiveTab(item.id);
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
                {menuItems.map(item => (
                    <li
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default Sidebar;
