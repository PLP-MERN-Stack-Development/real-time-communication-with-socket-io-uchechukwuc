import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: true
  },
  members: [{
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messageCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
roomSchema.index({ name: 1 });
roomSchema.index({ isPrivate: 1 });
roomSchema.index({ lastActivity: -1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;