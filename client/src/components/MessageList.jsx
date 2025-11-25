import { forwardRef } from 'react';
import Message from './Message.jsx';
import './MessageList.css';

const MessageList = forwardRef(({ messages, currentUser, onReact }, ref) => {
  return (
    <div className="message-list">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isOwn={message.sender === currentUser}
              onReact={onReact}
            />
          ))
        )}
        <div ref={ref} />
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;