import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI 
    // Skip MongoDB connection if password is not set
    if (mongoURI.includes('YOUR_PASSWORD_HERE')) {
      console.log('MongoDB password not configured. Using in-memory storage.');
      return false;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Falling back to in-memory storage.');
    return false;
  }
};

export default connectDB;