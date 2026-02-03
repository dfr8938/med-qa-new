import React from 'react';
import UserManagement from './UserManagement';

function UserSection({ user, onProfileEdit }) {
  return (
    <div className="user-info-section">
      <UserManagement user={user} />
      <div className="admin-controls-section">
        <button
          className="btn btn-secondary"
          onClick={onProfileEdit}
        >
          Редактировать профиль
        </button>
      </div>
    </div>
  );
}

export default UserSection;