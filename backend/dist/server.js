"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", limiter);
app.get("/api/test", (req, res) => {
    res.json({ message: "? SparkleClean Kenya Backend is LIVE!" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/clients", client_routes_1.default);
app.use("/api/invoices", invoice_routes_1.default);
app.use("/api/schedule", schedule_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});
const startServer = async () => {
    await (0, db_1.default)();
    app.listen(PORT, () => {
        console.log(`?? Server running on http://localhost:${PORT}`);
        console.log(`?? Test: http://localhost:${PORT}/api/test`);
        console.log(`?? Login: http://localhost:${PORT}/api/auth/login`);
    });
};
startServer();
//# sourceMappingURL=server.js.map