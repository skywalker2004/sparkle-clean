import mongoose from 'mongoose';

// Serverless-safe cached connection: reuses the connection across warm
// invocations on Vercel instead of reconnecting on every request.
let cached = (global as any).mongooseConnection as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = (global as any).mongooseConnection = { conn: null, promise: null };
}

const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined');

    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      bufferCommands: false,
      family: 4,
    })
      .then((m) => {
        console.log('✅ MongoDB Connected');
        return m as typeof mongoose;
      })
      .catch((err) => {
        // Reset the cached promise so a LATER request on this serverless
        // instance can retry a fresh connection, instead of re-awaiting the
        // same rejected promise forever (which previously turned a transient
        // network blip into a permanent 503 "Database temporarily unavailable").
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
