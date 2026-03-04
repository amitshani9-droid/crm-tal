import React from 'react';

function StatisticsHeader({ clients }) {
    const totalClients = clients.length;

    // Calculate calls scheduled for today
    const todayStr = new Date().toISOString().split('T')[0];
    const callsToday = clients.filter(c => {
        if (!c.nextCall) return false;
        return c.nextCall.split('T')[0] === todayStr;
    }).length;

    // Calculate new clients from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTime = thirtyDaysAgo.getTime();

    const monthlyGrowth = clients.filter(c => {
        if (!c.id) return false;
        const createdAt = parseInt(c.id, 10);
        // Fallback for mock IDs or invalid timestamps
        if (isNaN(createdAt)) return false;
        return createdAt >= thirtyDaysAgoTime;
    }).length;

    // We can add a 4th metric, like total scheduled calls or something else if needed.
    // Let's use "Total Scheduled Calls" for the 4th card based on the existing logic
    const allExpectedCalls = clients.filter(c => c.nextCall && c.nextCall !== "").length;

    return (
        <div className="stats-row">
            <div className="stat-card glass-card">
                <div className="stat-content">
                    <span className="stat-icon">👥</span>
                    <h3>סה״כ לקוחות</h3>
                </div>
                <p className="stat-value">{totalClients}</p>
            </div>

            <div className="stat-card glass-card">
                <div className="stat-content">
                    <span className="stat-icon">📈</span>
                    <h3>לקוחות חדשים (חודשי)</h3>
                </div>
                <p className="stat-value">{monthlyGrowth}</p>
            </div>

            <div className="stat-card glass-card">
                <div className="stat-content">
                    <span className="stat-icon">🔔</span>
                    <h3>שיחות מתוכננות (היום)</h3>
                </div>
                <p className="stat-value">{callsToday}</p>
            </div>

            <div className="stat-card glass-card">
                <div className="stat-content">
                    <span className="stat-icon">📅</span>
                    <h3>סה״כ שיחות עתידיות</h3>
                </div>
                <p className="stat-value">{allExpectedCalls}</p>
            </div>
        </div>
    );
}

export default StatisticsHeader;
