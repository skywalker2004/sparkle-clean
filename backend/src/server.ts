import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import invoiceRoutes from "./routes/invoice.routes";
import scheduleRoutes from "./routes/schedule.routes";
import bookingRoutes from "./routes/booking.routes";
import imageRoutes from "./routes/image.routes";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

/**
 * CORS origins are read from the CORS_ORIGINS environment variable
 * (comma-separated). In production on Vercel you MUST set, for example:
 *   CORS_ORIGINS=https://sparkleclean.co.ke,https://your-frontend.vercel.app,http://localhost:5173
 * A missing CORS_ORIGINS keeps the localhost development defaults below.
 * "Failed to fetch" in Chrome often means a CORS preflight rejection, so
 * every deployed frontend origin must appear here.
 */
const corsOrigins = (() => {
  const env = process.env.CORS_ORIGINS;
  if (env && env.trim()) {
    return env
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];
})();
console.log("🌐 CORS allowed origins:", corsOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", limiter);

app.get("/api/test", (req, res) => {
  res.json({ message: "? SparkleClean Kenya Backend is LIVE!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/images", imageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`?? Server running on http://localhost:${PORT}`);
    console.log(`?? Test: http://localhost:${PORT}/api/test`);
    console.log(`?? Login: http://localhost:${PORT}/api/auth/login`);
  });
};

startServer();