import React from 'react';

/**
 * AnalyticsSection Component
 * Visualizes CRM data using a custom SVG Pie Chart and summary cards.
 */
function AnalyticsSection({ clients }) {
    if (!clients || clients.length === 0) return null;

    // 1. Analytics Logic: Calculate distribution
    const total = clients.length;
    const stats = {
        new: clients.filter(c => c.status === 'חדש' || !c.status).length,
        active: clients.filter(c => c.status === 'בטיפול').length,
        closed: clients.filter(c => c.status === 'סגור').length
    };

    // Calculate Percentages
    const newPerc = ((stats.new / total) * 100).toFixed(0);
    const activePerc = ((stats.active / total) * 100).toFixed(0);
    const successRate = ((stats.closed / total) * 100).toFixed(0);

    // SVG Pie Chart Calculation (Simple approximation for 3 segments)
    // We'll use stroke-dasharray on a circle for a "Donut" style chart.
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    
    const newOffset = circumference;
    const activeOffset = circumference - (circumference * (stats.new / total));
    const closedOffset = circumference - (circumference * ((stats.new + stats.active) / total));

    return (
        <div className="analytics-container glass-card">
            <div className="analytics-content">
                {/* Visual Chart Section */}
                <div className="analytics-chart-box">
                    <div className="pie-chart-wrapper">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            {/* Background Circle */}
                            <circle cx="100" cy="100" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                            
                            {/* New leads segment (Purple) */}
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="transparent" 
                                stroke="#a78bfa" 
                                strokeWidth="22" 
                                strokeDasharray={`${(stats.new / total) * circumference} ${circumference}`}
                                transform="rotate(-90 100 100)"
                                strokeLinecap="round"
                            />
                            
                            {/* In Progress segment (Orange) */}
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="transparent" 
                                stroke="#fb923c" 
                                strokeWidth="22" 
                                strokeDasharray={`${(stats.active / total) * circumference} ${circumference}`}
                                transform={`rotate(${-90 + (stats.new / total) * 360} 100 100)`}
                                strokeLinecap="round"
                            />

                            {/* Closed segment (Green) */}
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="transparent" 
                                stroke="#4ade80" 
                                strokeWidth="22" 
                                strokeDasharray={`${(stats.closed / total) * circumference} ${circumference}`}
                                transform={`rotate(${-90 + ((stats.new + stats.active) / total) * 360} 100 100)`}
                                strokeLinecap="round"
                            />
                            
                            {/* Center Text */}
                            <text x="100" y="95" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">{total}</text>
                            <text x="100" y="120" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">סה"כ לקוחות</text>
                        </svg>
                    </div>
                    
                    <div className="chart-legend">
                        <div className="legend-item"><span className="dot purple"></span> חדשים ({stats.new})</div>
                        <div className="legend-item"><span className="dot orange"></span> בטיפול ({stats.active})</div>
                        <div className="legend-item"><span className="dot green"></span> סגורים ({stats.closed})</div>
                    </div>
                </div>

                {/* Summary Cards Section */}
                <div className="analytics-stats-grid">
                    <div className="mini-stat-card">
                        <span className="mini-label">לידים חדשים</span>
                        <span className="mini-value">{newPerc}%</span>
                        <div className="stat-progress"><div className="progress-bar purple" style={{ width: `${newPerc}%` }}></div></div>
                    </div>
                    <div className="mini-stat-card">
                        <span className="mini-label">בטיפול אקטיבי</span>
                        <span className="mini-value">{activePerc}%</span>
                        <div className="stat-progress"><div className="progress-bar orange" style={{ width: `${activePerc}%` }}></div></div>
                    </div>
                    <div className="mini-stat-card highlight">
                        <span className="mini-label">אחוז סגירה (Success)</span>
                        <span className="mini-value success">{successRate}%</span>
                        <div className="stat-progress"><div className="progress-bar green" style={{ width: `${successRate}%` }}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsSection;
