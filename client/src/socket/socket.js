// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import {
  requestNotificationPermission,
  handleNewMessageNotification,
  handleUserStatusNotification
} from '../utils/notifications.js';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    setCurrentUser(username);
    if (username) {
      socket.emit('user_join', username);
      // Join default room
      socket.emit('join_room', { roomName: currentRoom });
      // Request notification permission when user joins
      requestNotificationPermission();
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message, fileData = null) => {
    socket.emit('send_message', { message, room: currentRoom, file: fileData });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Add reaction to message
  const addReaction = (messageId, emoji) => {
    socket.emit('add_reaction', { messageId, emoji });
  };

  // Mark message as read
  const markMessageRead = (messageId) => {
    socket.emit('mark_message_read', { messageId });
  };

  // Join a room
  const joinRoom = (roomName) => {
    socket.emit('join_room', { roomName });
    setCurrentRoom(roomName);
  };

  // Get rooms list
  const getRooms = () => {
    socket.emit('get_rooms');
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Handle notifications for new messages
      handleNewMessageNotification(message, currentUser, selectedUser);

      // Update unread count if message is not in current view
      const isPrivateMessage = message.isPrivate;
      const isInPrivateChat = selectedUser && message.senderId === selectedUser.id;
      const isInGlobalChat = !selectedUser && !isPrivateMessage;

      if (!isInPrivateChat && !isInGlobalChat) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Handle notifications for private messages
      handleNewMessageNotification(message, currentUser, selectedUser);

      // Update unread count if not in private chat with this user
      if (!selectedUser || message.senderId !== selectedUser.id) {
        setUnreadCount(prev => prev + 1);
      }
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Handle notification
      handleUserStatusNotification(`${user.username} joined the chat`, true);
    };

    const onUserLeft = (user) => {
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Handle notification
      handleUserStatusNotification(`${user.username} left the chat`, false);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Message update events
    const onMessageUpdated = (updatedMessage) => {
      setMessages((prev) =>
        prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
      );
    };

    // Room events
    const onRoomsList = (roomsList) => {
      setRooms(roomsList);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('message_updated', onMessageUpdated);
    socket.on('rooms_list', onRoomsList);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('message_updated', onMessageUpdated);
      socket.off('rooms_list', onRoomsList);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    currentUser,
    selectedUser,
    setSelectedUser,
    unreadCount,
    setUnreadCount,
    currentRoom,
    setCurrentRoom,
    rooms,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    markMessageRead,
    joinRoom,
    getRooms,
  };
};

export default socket; 