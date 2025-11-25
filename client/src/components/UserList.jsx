import './UserList.css';

function UserList({ users, currentUser, selectedUser, onUserSelect, unreadCount }) {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <h4>Online Users ({users.length})</h4>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      <div className="users-container">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No users online</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.username}
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''} ${user.username === currentUser ? 'current' : ''}`}
              onClick={() => user.username !== currentUser && onUserSelect(user)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                {user.username === currentUser && (
                  <span className="user-status">You</span>
                )}
              </div>
              <div className="user-status-indicator">
                <span className="status-dot online"></span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="user-list-footer">
        <p className="user-tip">
          Click on a user to start a private chat
        </p>
      </div>
    </div>
  );
}

export default UserList;