import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket.js';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import UserList from './UserList.jsx';
import RoomList from './RoomList.jsx';
import './ChatRoom.css';

function ChatRoom({ username }) {
  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    isConnected,
    selectedUser,
    setSelectedUser,
    unreadCount,
    setUnreadCount,
    addReaction,
    markMessageRead,
    currentRoom,
    rooms,
    joinRoom,
    getRooms
  } = useSocket();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load rooms when component mounts
    getRooms();
  }, [getRooms]);

  useEffect(() => {
    // Join current room when component mounts or currentRoom changes
    if (isConnected && currentRoom) {
      joinRoom(currentRoom);
    }
  }, [isConnected, currentRoom, joinRoom]);

  useEffect(() => {
    if (!isConnected) {
      setSelectedUser(null);
    }
  }, [isConnected]);

  const handleSendMessage = (message, fileData) => {
    if (selectedUser) {
      sendPrivateMessage(selectedUser.id, message);
    } else {
      sendMessage(message, fileData);
    }
  };

  const handleUserSelect = (user) => {
    const newSelectedUser = user.id === selectedUser?.id ? null : user;
    setSelectedUser(newSelectedUser);

    // Reset unread count when switching to global chat or selecting a user
    if (!newSelectedUser) {
      setUnreadCount(0);
    }
  };

  const handleRoomSelect = (roomName) => {
    joinRoom(roomName);
    // Clear messages when switching rooms to show room-specific messages
    // In a real app, you'd load messages for the specific room
  };

  const filteredMessages = selectedUser
    ? messages.filter(msg =>
        (msg.senderId === selectedUser.id && msg.senderId !== username) ||
        (msg.senderId === username && msg.isPrivate)
      )
    : messages.filter(msg => !msg.isPrivate && msg.room === currentRoom);

  // Mark messages as read when they are viewed
  useEffect(() => {
    if (filteredMessages.length > 0 && username) {
      filteredMessages.forEach(message => {
        if (message.sender !== username && !message.readBy?.some(read => read.username === username)) {
          markMessageRead(message.id);
        }
      });
    }
  }, [filteredMessages, username, markMessageRead]);

  return (
    <div className="chat-room">
      <div className="chat-sidebar">
        <div className="sidebar-section">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
          />
        </div>
        <div className="sidebar-section">
          <UserList
            users={users}
            currentUser={username}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            unreadCount={unreadCount}
          />
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h3>
            {selectedUser
              ? `Private Chat with ${selectedUser.username}`
              : `#${currentRoom} Room`
            }
          </h3>
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
        </div>

        <MessageList
          messages={filteredMessages}
          currentUser={username}
          onReact={addReaction}
          ref={messagesEndRef}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={setTyping}
          disabled={!isConnected}
          placeholder={
            selectedUser
              ? `Message ${selectedUser.username}...`
              : 'Type a message...'
          }
        />
      </div>
    </div>
  );
}

export default ChatRoom;