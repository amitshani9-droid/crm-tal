import React from 'react';

function StatisticsBento({ totalClients, newLeads, activePipeline, closedDeals, todoToday }) {
  return (
    <div className="bento-grid-container">
      <div className="bento-card bento-main glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">⚡</span>
            <span className="bento-label high-contrast">בטיפול אקטיבי</span>
          </div>
          <div className="bento-value-large">{activePipeline}</div>
          <div className="bento-description high-contrast">לידים ותהליכים בשלבי עבודה שונים</div>
        </div>
      </div>

      <div className="bento-card bento-secondary glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">🌍</span>
            <span className="bento-label high-contrast">סה״כ במערכת</span>
          </div>
          <div className="bento-value">{totalClients}</div>
        </div>
      </div>

      <div className="bento-card bento-accent glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">🔔</span>
            <span className="bento-label high-contrast">משימות להיום</span>
          </div>
          <div className={`bento-value ${todoToday > 0 ? 'pulse-red-text' : ''}`}>{todoToday}</div>
        </div>
      </div>

      <div className="bento-card bento-highlight glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">🤝</span>
            <span className="bento-label high-contrast">עסקאות שנסגרו</span>
          </div>
          <div className="bento-value" style={{ color: '#00b894' }}>{closedDeals}</div>
        </div>
      </div>

      <div className="bento-card bento-info glass-bento-card">
        <div className="bento-card-content">
          <div className="bento-label-row">
            <span className="bento-icon">🌟</span>
            <span className="bento-label high-contrast">חדשים השבוע</span>
          </div>
          <div className="bento-value" style={{ color: '#6c5ce7' }}>{newLeads}</div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsBento;
