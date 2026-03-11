import React from 'react';

function AnalyticsSection({ clients }) {
    if (!clients || clients.length === 0) return null;

    const total = clients.length;
    const stats = {
        new: clients.filter(c => String(c.status) === 'חדש' || !c.status).length,
        active: clients.filter(c => String(c.status) === 'בטיפול').length,
        closed: clients.filter(c => String(c.status) === 'סגור').length
    };

    const newPerc = total > 0 ? ((stats.new / total) * 100).toFixed(0) : 0;
    const activePerc = total > 0 ? ((stats.active / total) * 100).toFixed(0) : 0;
    const successRate = total > 0 ? ((stats.closed / total) * 100).toFixed(0) : 0;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    
    const colors = {
        purple: '#6c5ce7',
        orange: '#fdcb6e',
        emerald: '#00b894'
    };

    return (
        <div className="analytics-container glass-card high-contrast">
            <div className="analytics-content">
                <div className="analytics-chart-box">
                    <div className="pie-chart-wrapper" style={{ position: 'relative' }}>
                        <svg width="220" height="220" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r={radius} fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="24" />
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="transparent" 
                                stroke={colors.purple} 
                                strokeWidth="24" 
                                strokeDasharray={`${(stats.new / total) * circumference} ${circumference}`}
                                transform="rotate(-90 100 100)"
                                strokeLinecap="round"
                            />
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="transparent" 
                                stroke={colors.orange} 
                                strokeWidth="24" 
                                strokeDasharray={`${(stats.active / total) * circumference} ${circumference}`}
                                transform={`rotate(${-90 + (stats.new / total) * 360} 100 100)`}
                                strokeLinecap="round"
                            />
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="transparent" 
                                stroke={colors.emerald} 
                                strokeWidth="24" 
                                strokeDasharray={`${(stats.closed / total) * circumference} ${circumference}`}
                                transform={`rotate(${-90 + ((stats.new + stats.active) / total) * 360} 100 100)`}
                                strokeLinecap="round"
                            />
                            <text x="100" y="98" textAnchor="middle" fill="#2c3e50" fontSize="28" fontWeight="800">{total}</text>
                            <text x="100" y="122" textAnchor="middle" fill="#546e7a" fontSize="13" fontWeight="700">לקוחות</text>
                        </svg>
                    </div>
                    
                    <div className="chart-legend high-contrast">
                        <div className="legend-item"><span className="dot purple-solid"></span> כניסת לידים ({stats.new})</div>
                        <div className="legend-item"><span className="dot orange-solid"></span> תהליכי עבודה ({stats.active})</div>
                        <div className="legend-item"><span className="dot green-solid"></span> הצלחות ({stats.closed})</div>
                    </div>
                </div>

                <div className="analytics-stats-grid">
                    <div className="mini-stat-card high-contrast">
                        <span className="mini-label contrast">שיעור לידים חדשים</span>
                        <span className="mini-value-large">{newPerc}%</span>
                        <div className="stat-progress dark-bg"><div className="progress-bar purple-solid" style={{ width: `${newPerc}%` }}></div></div>
                    </div>
                    <div className="mini-stat-card high-contrast">
                        <span className="mini-label contrast">אפיק מכירות פעיל</span>
                        <span className="mini-value-large" style={{ color: '#f39c12' }}>{activePerc}%</span>
                        <div className="stat-progress dark-bg"><div className="progress-bar orange-solid" style={{ width: `${activePerc}%` }}></div></div>
                    </div>
                    <div className="mini-stat-card highlight high-contrast">
                        <span className="mini-label contrast" style={{ color: '#27ae60' }}>שיעור הצלחה</span>
                        <span className="mini-value-large emerald">{successRate}%</span>
                        <div className="stat-progress dark-bg"><div className="progress-bar emerald-solid" style={{ width: `${successRate}%` }}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsSection;
