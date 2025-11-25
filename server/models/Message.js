import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  reactions: [{
    emoji: String,
    count: {
      type: Number,
      default: 1
    }
  }],
  room: {
    type: String,
    default: 'general'
  },
  readBy: [{
    userId: String,
    username: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ timestamp: -1 });
messageSchema.index({ room: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;