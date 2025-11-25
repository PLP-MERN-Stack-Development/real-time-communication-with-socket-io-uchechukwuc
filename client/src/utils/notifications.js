// notifications.js - Browser notification utilities

// Request permission for browser notifications
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show browser notification
export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });
  }
  return null;
};

// Play sound notification
export const playSound = (soundType = 'message') => {
  try {
    const audio = new Audio();
    audio.volume = 0.3;

    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (soundType === 'message') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    } else if (soundType === 'join') {
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.1);
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Sound notification failed:', error);
  }
};

// Check if document is visible
export const isDocumentVisible = () => {
  return !document.hidden;
};

// Handle new message notifications
export const handleNewMessageNotification = (message, currentUser, selectedUser) => {
  // Don't notify for own messages
  if (message.sender === currentUser) return;

  // Don't notify if chat is visible and message is in current conversation
  if (isDocumentVisible()) {
    const isPrivateMessage = message.isPrivate;
    const isInPrivateChat = selectedUser && message.senderId === selectedUser.id;
    const isInGlobalChat = !selectedUser && !isPrivateMessage;

    if (isInPrivateChat || isInGlobalChat) return;
  }

  // Show browser notification
  const title = message.isPrivate
    ? `Private message from ${message.sender}`
    : `New message from ${message.sender}`;

  showNotification(title, {
    body: message.message,
    tag: `chat-${message.senderId}`,
    requireInteraction: false,
  });

  // Play sound
  playSound('message');
};

// Handle user join/leave notifications
export const handleUserStatusNotification = (message, isJoin = true) => {
  if (!isDocumentVisible()) {
    const title = isJoin ? 'User joined' : 'User left';
    showNotification(title, {
      body: message,
      tag: 'user-status',
      requireInteraction: false,
    });
  }

  playSound('join');
};