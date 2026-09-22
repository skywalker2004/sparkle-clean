import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected Successfully');
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MongoDB Connection Error:', message);
    console.warn('⚠️ Continuing without MongoDB; image and booking routes will use fallback behavior until the database is reachable.');
    return false;
  }
};

export default connectDB;