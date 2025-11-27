https://real-time-communication-with-socket-eta-nine.vercel.app

# 🔄 Real-Time Chat Application with Socket.io

A modern, real-time chat application built with Socket.io, React, and Node.js. Features bidirectional communication, private messaging, message reactions, and comprehensive notifications.

**Week 5 Assignment - Real-Time Communication with Socket.io** - Complete implementation of all required tasks including core chat functionality, advanced features, and real-time notifications.

## 🚀 Features

### Core Functionality
- ✅ **Real-time messaging** - Instant message delivery using Socket.io
- ✅ **User authentication** - Simple username-based login system
- ✅ **Multiple chat rooms** - Switch between different channels (#general, #random, #tech, #gaming)
- ✅ **Private messaging** - Direct messages between users
- ✅ **Online status** - See who's online and available to chat
- ✅ **Typing indicators** - Know when someone is typing a message
- ✅ **Message timestamps** - All messages include send time

### Advanced Features
- ✅ **Message reactions** - React to messages with emojis (👍❤️😂😮😢😡)
- ✅ **Read receipts** - See when messages are sent (✓) and read (✓✓)
- ✅ **File & image sharing** - Upload and share images, documents, and files (up to 10MB)
- ✅ **Browser notifications** - Get notified of new messages when app is not focused
- ✅ **Sound notifications** - Audio alerts for new messages and user activity
- ✅ **Unread message count** - Track unread messages in the sidebar
- ✅ **Responsive design** - Works seamlessly on desktop and mobile devices
- ✅ **Connection status** - Visual indicators for connection state

### Technical Features
- ✅ **Automatic reconnection** - Handles network interruptions gracefully
- ✅ **Message persistence** - Messages stored in MongoDB with in-memory fallback
- ✅ **Real-time user list** - Live updates of online users
- ✅ **System messages** - Notifications for user join/leave events
- ✅ **Room-based messaging** - Messages are scoped to specific chat rooms
- ✅ **File upload system** - Secure file storage with type validation

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, MongoDB/Mongoose
- **Database**: MongoDB Atlas (with in-memory fallback)
- **Styling**: CSS3 with modern design patterns
- **Real-time Communication**: Socket.io with WebSocket protocol

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.jsx
│   │   │   ├── ChatRoom.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── UserList.jsx
│   │   │   └── RoomList.jsx
│   │   ├── socket/         # Socket.io client setup
│   │   ├── utils/          # Utility functions
│   │   │   └── notifications.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── models/             # Mongoose models
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Room.js
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-communication-with-socket-io
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the development servers**

   **Terminal 1 - Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Client:**
   ```bash
   cd client
   npm run dev
   ```

5. **Open your browser**
    - Client will be running at: `http://localhost:5174`
    - Server will be running at: `http://localhost:5001`

## 🎯 Usage

1. **Join the chat**: Enter a unique username to join the chat room
2. **Switch rooms**: Click on room names in the left sidebar (#general, #random, #tech, #gaming)
3. **Send messages**: Type in the input field and press Enter or click send
4. **Share files**: Click the 📎 button to attach images or documents (up to 10MB)
5. **Private messaging**: Click on a user's name in the right sidebar to start a private conversation
6. **React to messages**: Click the 😊 button on any message to add reactions
7. **Read receipts**: See ✓ (sent) and ✓✓ (read) status on your messages
8. **Notifications**: Grant browser notification permission for alerts when away from the app

## 🔧 Configuration

### Environment Variables

**Client (.env)**
```
VITE_SOCKET_URL=http://localhost:5001
```



**MongoDB Setup**
1. Replace `YOUR_PASSWORD_HERE` with your actual MongoDB Atlas password
2. If MongoDB connection fails, the app automatically falls back to in-memory storage
3. The app works with or without MongoDB - no MongoDB means data is stored in memory only

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Socket.io](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for fast development builds
- [Express](https://expressjs.com/) for the backend framework

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the development team.

---

**Happy chatting! 🎉**