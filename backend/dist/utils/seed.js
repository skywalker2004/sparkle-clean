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
const date_fns_1 = require("date-fns");
dotenv_1.default.config();
const seed = async () => {
    await (0, db_1.default)();
    if (mongoose_1.default.connection.db) {
        await mongoose_1.default.connection.db.dropDatabase();
        console.log("🗑️  Database cleared");
    }
    // ── Admin ─────────────────────────────────────────────────
    const admin = new User_model_1.default({
        email: "admin@sparkleclean.co.ke",
        password: "Roggy@2026!",
        name: "Roggy",
        role: "admin",
    });
    await admin.save();
    console.log("✅ Admin created: admin@sparkleclean.co.ke / Roggy@2026!");
    // ── Clients ───────────────────────────────────────────────
    const now = new Date();
    const clients = await Client_model_1.default.insertMany([
        {
            name: "Wanjiru Kamau", phone: "+254 712 345 678",
            email: "wanjiru.kamau@gmail.com", address: "Westlands, Nairobi",
            serviceType: "Standard", pricePerVisit: 3500, frequency: "weekly",
            status: "active", notes: "Has a guard dog — call before arriving",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 5).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 90).toISOString(), createdBy: admin._id,
        },
        {
            name: "Otieno Odhiambo", phone: "+254 723 456 789",
            email: "otieno@outlook.com", address: "Karen, Nairobi",
            serviceType: "Deep Clean", pricePerVisit: 7500, frequency: "biweekly",
            status: "active", notes: "Prefers cleaning on Saturdays",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 10).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 120).toISOString(), createdBy: admin._id,
        },
        {
            name: "Fatuma Hassan", phone: "+254 733 567 890",
            email: "fatuma.hassan@yahoo.com", address: "Lavington, Nairobi",
            serviceType: "Move-In/Out", pricePerVisit: 12000, frequency: "monthly",
            status: "active", notes: "Gate code: 2024",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 28).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 60).toISOString(), createdBy: admin._id,
        },
        {
            name: "Kipchoge Mutai", phone: "+254 745 678 901",
            email: "kipchoge.mutai@gmail.com", address: "Kilimani, Nairobi",
            serviceType: "Deep Clean", pricePerVisit: 9000, frequency: "biweekly",
            status: "active", notes: "Two floors — extra time needed",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 12).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 150).toISOString(), createdBy: admin._id,
        },
        {
            name: "Aisha Mwangi", phone: "+254 756 789 012",
            email: "aisha.mwangi@gmail.com", address: "Runda, Nairobi",
            serviceType: "Standard", pricePerVisit: 4500, frequency: "weekly",
            status: "active", notes: "Has allergies — use fragrance-free products only",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 6).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 45).toISOString(), createdBy: admin._id,
        },
        {
            name: "David Kariuki", phone: "+254 767 890 123",
            email: "david.kariuki@gmail.com", address: "Gigiri, Nairobi",
            serviceType: "Move-In/Out", pricePerVisit: 15000, frequency: "monthly",
            status: "active", notes: "Large compound with swimming pool",
            lastCleanedDate: null, dateAdded: (0, date_fns_1.subDays)(now, 30).toISOString(), createdBy: admin._id,
        },
        {
            name: "Amina Osman", phone: "+254 778 901 234",
            email: "amina.osman@gmail.com", address: "Parklands, Nairobi",
            serviceType: "Standard", pricePerVisit: 3800, frequency: "weekly",
            status: "active", notes: "Leave supplies in the utility room",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 4).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 75).toISOString(), createdBy: admin._id,
        },
        {
            name: "Njoroge Githuku", phone: "+254 789 012 345",
            email: "njoroge@gmail.com", address: "Kileleshwa, Nairobi",
            serviceType: "Standard", pricePerVisit: 3000, frequency: "weekly",
            status: "inactive", notes: "Service on hold until further notice",
            lastCleanedDate: (0, date_fns_1.subDays)(now, 45).toISOString(), dateAdded: (0, date_fns_1.subDays)(now, 180).toISOString(), createdBy: admin._id,
        },
    ]);
    console.log(`✅ ${clients.length} clients seeded`);
    // ── Invoices ──────────────────────────────────────────────
    const invoiceData = [];
    for (let i = 0; i < 12; i++) {
        const date = (0, date_fns_1.subDays)(now, 7 * (i + 1));
        const client = clients[i % 5];
        invoiceData.push({
            invoiceNumber: `SC-${String(i + 1).padStart(4, "0")}`,
            clientId: client._id.toString(),
            clientName: client.name,
            amount: client.pricePerVisit,
            dueDate: date.toISOString(),
            status: "paid",
            paidDate: (0, date_fns_1.addDays)(date, 2).toISOString(),
            notes: "",
        });
    }
    invoiceData.push({
        invoiceNumber: "SC-0101",
        clientId: clients[0]._id.toString(),
        clientName: clients[0].name,
        amount: clients[0].pricePerVisit,
        dueDate: (0, date_fns_1.subDays)(now, 5).toISOString(),
        status: "unpaid", paidDate: null, notes: "",
    }, {
        invoiceNumber: "SC-0102",
        clientId: clients[1]._id.toString(),
        clientName: clients[1].name,
        amount: clients[1].pricePerVisit,
        dueDate: (0, date_fns_1.subDays)(now, 10).toISOString(),
        status: "unpaid", paidDate: null, notes: "",
    }, {
        invoiceNumber: "SC-0103",
        clientId: clients[3]._id.toString(),
        clientName: clients[3].name,
        amount: clients[3].pricePerVisit,
        dueDate: (0, date_fns_1.subDays)(now, 12).toISOString(),
        status: "unpaid", paidDate: null, notes: "",
    });
    await Invoice_model_1.default.insertMany(invoiceData);
    console.log(`✅ ${invoiceData.length} invoices seeded`);
    console.log("\n🎉 Seed complete!");
    console.log("   Email:    admin@sparkleclean.co.ke");
    console.log("   Password: Roggy@2026!\n");
    process.exit(0);
};
seed().catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map