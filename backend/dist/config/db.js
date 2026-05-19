"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB Connected Successfully');
    }
    catch (error) { // FIXED: Use 'unknown' for better type safety (strict mode)
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ MongoDB Connection Error:', message);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map