import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db';
import clientRoutes from './routes/client.routes';
import invoiceRoutes from './routes/invoice.routes';
import scheduleRoutes from './routes/schedule.routes';
import { getDashboardStats } from './controllers/invoice.controller'; // For dashboard

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;  // FIXED: Use Number() to avoid type error on env var

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ SparkleClean Backend is LIVE!' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Test it here → http://localhost:${PORT}/api/test`);
  });
};

startServer();