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
  } catch (error: unknown) {  // FIXED: Use 'unknown' for better type safety (strict mode)
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MongoDB Connection Error:', message);
    process.exit(1);
  }
};

export default connectDB;