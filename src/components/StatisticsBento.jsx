import React from 'react';

/**
 * StatisticsBento Component
 * A high-end Bento Grid statistics dashboard using CSS Grid and Glassmorphism.
 */
function StatisticsBento({ totalClients, newLeads, activePipeline, closedDeals, todoToday }) {
  return (
    <div className="bento-grid-container">
      {/* Primary Visual Anchor: Active Pipeline */}
      <div className="bento-card bento-main glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">🔥</span>
            <span className="bento-label">בטיפול אקטיבי</span>
          </div>
          <div className="bento-value-large">{activePipeline}</div>
          <div className="bento-description">לידים בתהליך מכירה מתקדם</div>
        </div>
      </div>

      {/* Total Clients Card */}
      <div className="bento-card bento-secondary glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">👥</span>
            <span className="bento-label">סה״כ לקוחות</span>
          </div>
          <div className="bento-value">{totalClients}</div>
        </div>
      </div>

      {/* To-Do Today Card */}
      <div className="bento-card bento-accent glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">🚨</span>
            <span className="bento-label">לטיפול היום</span>
          </div>
          <div className="bento-value pulse-text">{todoToday}</div>
        </div>
      </div>

      {/* Closed Deals Card */}
      <div className="bento-card bento-highlight glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">💰</span>
            <span className="bento-label">עסקאות שנסגרו</span>
          </div>
          <div className="bento-value">{closedDeals}</div>
        </div>
      </div>

      {/* New Leads This Week */}
      <div className="bento-card bento-info glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">✨</span>
            <span className="bento-label">לידים חדשים (שבוע)</span>
          </div>
          <div className="bento-value">{newLeads}</div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsBento;
