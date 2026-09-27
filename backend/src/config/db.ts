import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect options tuned for serverless cold starts (Vercel functions):
 * - `serverSelectionTimeoutMS` (10s): fail fast instead of letting the first
 *   request hang until the platform's hard request timeout kills it silently
 *   (which presents to the frontend as "Failed to fetch").
 * - `connectTimeoutMS` / `socketTimeoutMS`: bounded handshake & I/O windows.
 * - `family: 4`: Atlas clusters use IPv4; skips IPv6 lookups that often delay
 *   serverless connections.
 */
const mongoOptions = {
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  family: 4,
  retryWrites: true,
  maxPoolSize: 10,
};

const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in .env');
    return false;
  }

  try {
    // Attempt 1 — use the runtime's DEFAULT DNS resolver.
    // On Vercel the platform resolver usually handles MongoDB Atlas SRV
    // records correctly; overriding DNS globally on first try can break it.
    try {
      await mongoose.connect(mongoUri, mongoOptions);
    } catch (firstError) {
      console.warn(
        '⚠️ Initial MongoDB connection failed — retrying with public DNS resolvers:',
        firstError instanceof Error ? firstError.message : firstError,
      );
      // Attempt 2 — some sandboxed networks (e.g. restricted corporate/VPN
      // networks, some CI sandboxes) block the default resolver's SRV
      // (port 53) queries but allow public resolvers. Throws if it fails too.
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      await mongoose.connect(mongoUri, mongoOptions);
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    console.log('✅ MongoDB Connected Successfully');
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MongoDB Connection Error:', message);
    console.warn(
      '⚠️ Continuing without MongoDB. Login/auth, booking and reset routes will return errors until the database is reachable.',
    );
    return false;
  }
};

export default connectDB;
