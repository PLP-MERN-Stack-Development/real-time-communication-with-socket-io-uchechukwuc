// server.js - Main server file for Socket.io chat application

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import Message from './models/Message.js';
import User from './models/User.js';
import Room from './models/Room.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
const mongoConnected = await connectDB();

// Create default rooms if MongoDB is connected
if (mongoConnected) {
  const defaultRooms = [
    { name: 'general', description: 'General discussion', createdBy: 'system' },
    { name: 'random', description: 'Random chat', createdBy: 'system' },
    { name: 'tech', description: 'Technology discussions', createdBy: 'system' },
    { name: 'gaming', description: 'Gaming discussions', createdBy: 'system' }
  ];

  for (const roomData of defaultRooms) {
    try {
      await Room.findOneAndUpdate(
        { name: roomData.name },
        roomData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error creating room ${roomData.name}:`, error);
    }
  }
  console.log('Default rooms initialized');
}

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Store connected users (in-memory for real-time tracking)
const connectedUsers = {};
const typingUsers = {};

// In-memory storage fallback
const users = {};
const messages = [];

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', async (username) => {
    try {
      if (mongoConnected) {
        // Use MongoDB
        const user = await User.findOneAndUpdate(
          { username },
          {
            username,
            socketId: socket.id,
            isOnline: true,
            lastSeen: new Date()
          },
          { upsert: true, new: true }
        );

        connectedUsers[socket.id] = user;

        // Get all online users
        const onlineUsers = await User.find({ isOnline: true }).select('username socketId');
        const userList = onlineUsers.map(u => ({
          username: u.username,
          id: u.socketId
        }));

        io.emit('user_list', userList);
        io.emit('user_joined', { username: user.username, id: user.socketId });
      } else {
        // Use in-memory storage
        users[socket.id] = { username, id: socket.id };
        io.emit('user_list', Object.values(users));
        io.emit('user_joined', { username, id: socket.id });
      }
      console.log(`${username} joined the chat`);
    } catch (error) {
      console.error('Error handling user join:', error);
      // Fallback to in-memory
      users[socket.id] = { username, id: socket.id };
      io.emit('user_list', Object.values(users));
      io.emit('user_joined', { username, id: socket.id });
    }
  });

  // Handle chat messages
  socket.on('send_message', async (messageData) => {
    try {
      const username = mongoConnected
        ? connectedUsers[socket.id]?.username || 'Anonymous'
        : users[socket.id]?.username || 'Anonymous';

      const roomName = messageData.room || 'general';

      const message = {
        ...messageData,
        id: Date.now(),
        sender: username,
        senderId: socket.id,
        timestamp: new Date().toISOString(),
        reactions: [],
        room: roomName,
        readBy: [],
      };

      if (mongoConnected) {
        // Save to MongoDB
        const savedMessage = new Message(message);
        await savedMessage.save();

        // Update room message count
        await Room.findOneAndUpdate(
          { name: roomName },
          {
            $inc: { messageCount: 1 },
            lastActivity: new Date()
          }
        );
      } else {
        // Use in-memory storage
        messages.push(message);
        // Limit stored messages to prevent memory issues
        if (messages.length > 100) {
          messages.shift();
        }
      }

      // Send to room instead of all clients
      io.to(roomName).emit('receive_message', message);
    } catch (error) {
      console.error('Error handling message:', error);
      // Fallback to in-memory
      const username = users[socket.id]?.username || 'Anonymous';
      const roomName = messageData.room || 'general';
      const message = {
        ...messageData,
        id: Date.now(),
        sender: username,
        senderId: socket.id,
        timestamp: new Date().toISOString(),
        reactions: [],
        room: roomName,
        readBy: [],
        file: messageData.file || null,
      };
      messages.push(message);
      if (messages.length > 100) {
        messages.shift();
      }
      io.to(roomName).emit('receive_message', message);
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
      reactions: [],
      readBy: [],
    };

    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle message reactions
  socket.on('add_reaction', async ({ messageId, emoji }) => {
    try {
      if (mongoConnected) {
        // Use MongoDB
        const message = await Message.findById(messageId);
        if (message) {
          if (!message.reactions) {
            message.reactions = [];
          }

          const existingReaction = message.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            existingReaction.count += 1;
          } else {
            message.reactions.push({ emoji, count: 1 });
          }

          await message.save();
          io.emit('message_updated', message);
        }
      } else {
        // Use in-memory storage
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
          if (!message.reactions) {
            message.reactions = [];
          }

          const existingReaction = message.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            existingReaction.count += 1;
          } else {
            message.reactions.push({ emoji, count: 1 });
          }

          io.emit('message_updated', message);
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  });

  // Handle message read receipts
  socket.on('mark_message_read', async ({ messageId }) => {
    try {
      const username = mongoConnected
        ? connectedUsers[socket.id]?.username || 'Anonymous'
        : users[socket.id]?.username || 'Anonymous';

      if (mongoConnected) {
        // Use MongoDB
        const message = await Message.findById(messageId);
        if (message) {
          // Check if user already read this message
          const alreadyRead = message.readBy.some(read => read.userId === socket.id);
          if (!alreadyRead) {
            message.readBy.push({
              userId: socket.id,
              username: username,
              readAt: new Date()
            });
            await message.save();
            io.emit('message_updated', message);
          }
        }
      } else {
        // Use in-memory storage
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
          const alreadyRead = message.readBy?.some(read => read.userId === socket.id);
          if (!alreadyRead) {
            if (!message.readBy) {
              message.readBy = [];
            }
            message.readBy.push({
              userId: socket.id,
              username: username,
              readAt: new Date()
            });
            io.emit('message_updated', message);
          }
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle room switching
  socket.on('join_room', async ({ roomName }) => {
    try {
      // Leave current room
      const currentRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      currentRooms.forEach(room => socket.leave(room));

      // Join new room
      socket.join(roomName);

      if (mongoConnected) {
        // Update room activity
        await Room.findOneAndUpdate(
          { name: roomName },
          { lastActivity: new Date() }
        );
      }

      console.log(`${connectedUsers[socket.id]?.username || users[socket.id]?.username} joined room: ${roomName}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  // Handle getting rooms list
  socket.on('get_rooms', async () => {
    try {
      if (mongoConnected) {
        const rooms = await Room.find({}).select('name description messageCount lastActivity').sort({ lastActivity: -1 });
        socket.emit('rooms_list', rooms);
      } else {
        // Return default rooms for in-memory mode
        const defaultRooms = [
          { name: 'general', description: 'General discussion', messageCount: messages.length, lastActivity: new Date() },
          { name: 'random', description: 'Random chat', messageCount: 0, lastActivity: new Date() },
          { name: 'tech', description: 'Technology discussions', messageCount: 0, lastActivity: new Date() },
          { name: 'gaming', description: 'Gaming discussions', messageCount: 0, lastActivity: new Date() }
        ];
        socket.emit('rooms_list', defaultRooms);
      }
    } catch (error) {
      console.error('Error getting rooms:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    };

    res.json(fileData);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running on port 5000');
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server, io };