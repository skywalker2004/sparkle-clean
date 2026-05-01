"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Client_model_1 = __importDefault(require("../models/Client.model"));
const Invoice_model_1 = __importDefault(require("../models/Invoice.model"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
const seed = async () => {
    await (0, db_1.default)();
    if (mongoose_1.default.connection.db) {
        await mongoose_1.default.connection.db.dropDatabase(); // Clear DB for fresh seed
    }
    else {
        throw new Error('Database connection not established');
    }
    // Create admin
    const admin = new User_model_1.default({
        email: 'admin@sparkleclean.com',
        password: 'Kevo@2004',
        name: 'Admin User',
        role: 'admin',
    });
    await admin.save();
    // Sample clients
    const clients = [
        {
            name: 'John Doe',
            phone: '123-456-7890',
            address: '123 Main St, Miami, FL',
            serviceType: 'Standard',
            pricePerVisit: 100,
            frequency: 'weekly',
            createdBy: admin._id,
        },
        {
            name: 'Jane Smith',
            phone: '987-654-3210',
            address: '456 Oak Ave, Orlando, FL',
            serviceType: 'Deep Clean',
            pricePerVisit: 150,
            frequency: 'biweekly',
            createdBy: admin._id,
        },
        {
            name: 'Bob Johnson',
            phone: '555-123-4567',
            address: '789 Pine Rd, Tampa, FL',
            serviceType: 'Move-In/Out',
            pricePerVisit: 200,
            frequency: 'monthly',
            createdBy: admin._id,
        },
    ];
    const savedClients = await Client_model_1.default.insertMany(clients);
    // Sample invoices
    const invoices = [
        {
            client: savedClients[0]._id,
            invoiceNumber: 'INV-202602-0001',
            amount: 100,
            dueDate: new Date(),
            status: 'unpaid',
        },
        {
            client: savedClients[1]._id,
            invoiceNumber: 'INV-202602-0002',
            amount: 150,
            dueDate: new Date(),
            status: 'paid',
            paidDate: new Date(),
        },
    ];
    await Invoice_model_1.default.insertMany(invoices);
    console.log('✅ Database seeded successfully!');
    process.exit(0);
};
seed().catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
});
