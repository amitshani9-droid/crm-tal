import React from 'react';
import { getInitials } from '../../utils/formatters';

export function ClientHeader({ contact, company, avatarIndex, onContactChange, onCompanyChange }) {
  return (
    <div className="profile-header-info">
      <div className={`avatar-large gradient-${avatarIndex || 1}`}>
        <span className="avatar-initials">{getInitials(contact)}</span>
      </div>
      <div className="profile-titles">
        <input
          type="text"
          className="editable-title"
          value={contact || ''}
          onChange={e => onContactChange(e.target.value)}
          placeholder="שם איש קשר..."
        />
        <input
          type="text"
          className="editable-subtitle"
          value={company || ''}
          onChange={e => onCompanyChange(e.target.value)}
          placeholder="שם חברה..."
        />
      </div>
    </div>
  );
}
