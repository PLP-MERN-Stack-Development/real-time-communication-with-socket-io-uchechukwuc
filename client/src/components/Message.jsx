import { useState } from 'react';
import './Message.css';

const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

function Message({ message, isOwn, onReact }) {
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSystemMessage = message.system;

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (emoji) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
    setShowReactions(false);
  };

  if (isSystemMessage) {
    return (
      <div className="message system-message">
        <div className="message-content">
          <span className="system-text">{message.message}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="message-avatar">
          {message.sender.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">{message.sender}</div>
        )}
        <div className="message-bubble">
          <span className="message-text">{message.message}</span>
          {message.file && (
            <div className="message-file">
              {message.file.mimetype?.startsWith('image/') ? (
                <img
                  src={`${API_BASE_URL}${message.file.url}`}
                  alt={message.file.originalName}
                  className="message-image"
                  onLoad={() => console.log('Image loaded')}
                  onError={(e) => console.error('Image failed to load', e)}
                />
              ) : (
                <div className="file-attachment">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <a
                      href={`${API_BASE_URL}${message.file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      {message.file.originalName}
                    </a>
                    <span className="file-size">
                      {(message.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          {message.isPrivate && (
            <span className="private-indicator">🔒</span>
          )}
          {!isSystemMessage && (
            <button
              className="reaction-btn"
              onClick={() => setShowReactions(!showReactions)}
              title="Add reaction"
            >
              😊
            </button>
          )}
          {showReactions && (
            <div className="reactions-popup">
              {reactions.map(emoji => (
                <button
                  key={emoji}
                  className="reaction-emoji"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className="message-reactions">
            {message.reactions.map((reaction, index) => (
              <span key={index} className="reaction-item">
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </div>
        )}
        <div className="message-footer">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="message-status">
              {message.readBy && message.readBy.length > 0 ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;