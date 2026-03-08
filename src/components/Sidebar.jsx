import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'דשבורד ראשי', icon: '📊' },
        { id: 'settings', label: 'הגדרות', icon: '⚙️' },
        { id: 'join', label: 'קישור לדף נחיתה', icon: '🔗', isExternal: true }
    ];

    const handleItemClick = (item) => {
        if (item.isExternal) {
            window.open('/join', '_blank');
        } else {
            setActiveTab(item.id);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Tal<span>CRM</span></h2>
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
