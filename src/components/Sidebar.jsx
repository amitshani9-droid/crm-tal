import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'דשבורד ראשי', icon: '📊' },
        { id: 'settings', label: 'הגדרות', icon: '⚙️' }
    ];

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
                        onClick={() => setActiveTab(item.id)}
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
