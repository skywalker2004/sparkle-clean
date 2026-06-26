"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyRevenue = exports.getDashboardStats = exports.recordCleaning = exports.markUnpaid = exports.markPaid = exports.createInvoice = exports.getInvoices = void 0;
const Invoice_model_1 = __importDefault(require("../models/Invoice.model"));
const Client_model_1 = __importDefault(require("../models/Client.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const date_fns_1 = require("date-fns");
const getInvoices = async (req, res) => {
    try {
        const { status, month, client } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (client)
            query.clientId = client;
        if (month) {
            const [year, mon] = month.split("-");
            const start = new Date(Number(year), Number(mon) - 1, 1);
            const end = new Date(Number(year), Number(mon), 0);
            query.dueDate = { $gte: start, $lte: end };
        }
        const invoices = await Invoice_model_1.default.find(query).sort({ createdAt: -1 }).lean();
        res.json(invoices.map(inv => ({ ...inv, id: inv._id })));
    }
    catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: "Failed to fetch invoices" });
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res) => {
    try {
        const { clientId, amount, dueDate, notes } = req.body;
        const clientDoc = await Client_model_1.default.findById(clientId);
        if (!clientDoc)
            return res.status(404).json({ message: "Client not found" });
        const count = await Invoice_model_1.default.countDocuments();
        const invoiceNumber = `SC-${String(count + 1).padStart(4, "0")}`;
        const invoice = new Invoice_model_1.default({
            clientId,
            clientName: clientDoc.name,
            invoiceNumber,
            amount,
            dueDate,
            status: "unpaid",
            paidDate: null,
            notes,
        });
        await invoice.save();
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ message: "Failed to create invoice" });
    }
};
exports.createInvoice = createInvoice;
const markPaid = async (req, res) => {
    try {
        const { ids } = req.body;
        await Invoice_model_1.default.updateMany({ _id: { $in: ids } }, { status: "paid", paidDate: new Date() });
        res.json({ message: "Invoices marked as paid" });
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
exports.markPaid = markPaid;
const markUnpaid = async (req, res) => {
    try {
        const { ids } = req.body;
        await Invoice_model_1.default.updateMany({ _id: { $in: ids } }, { status: "unpaid", paidDate: null });
        res.json({ message: "Invoices reversed to unpaid" });
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
exports.markUnpaid = markUnpaid;
const recordCleaning = async (req, res) => {
    try {
        console.log("recordCleaning req.body:", req.body);
        const { clientId, date, notes } = req.body;
        console.log("Searching for clientId:", clientId);
        const client = await Client_model_1.default.findById(clientId);
        console.log("Client found:", client ? { id: client._id, name: client.name } : null);
        if (!client)
            return res.status(404).json({ message: "Client not found" });
        client.lastCleanedDate = new Date(date);
        if (notes)
            client.notes = notes;
        await client.save();
        const invoiceNumber = `SC-${Date.now()}`;
        const invoice = await Invoice_model_1.default.create({
            invoiceNumber,
            client: client._id,
            clientName: client.name,
            amount: client.pricePerVisit,
            dueDate: (0, date_fns_1.addDays)(new Date(date), 14),
            status: "unpaid",
            paidDate: null,
            notes: notes || "",
        });
        res.status(201).json({ ...invoice.toJSON(), id: invoice._id });
    }
    catch (error) {
        console.error("recordCleaning error:", error.message, error.stack);
        res.status(500).json({ message: error.message });
    }
};
exports.recordCleaning = recordCleaning;
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const weekEnd = (0, date_fns_1.addDays)(now, 7);
        const activeClients = await Client_model_1.default.find({ status: "active" });
        const revenueThisMonth = await Invoice_model_1.default.aggregate([
            { $match: { status: "paid", paidDate: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const outstanding = await Invoice_model_1.default.aggregate([
            { $match: { status: "unpaid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const upcomingThisWeek = activeClients.filter(c => {
            if (!c.lastCleanedDate || c.status !== "active")
                return false;
            const last = new Date(c.lastCleanedDate);
            const next = c.frequency === "weekly"
                ? (0, date_fns_1.addDays)(last, 7)
                : c.frequency === "biweekly"
                    ? (0, date_fns_1.addDays)(last, 14)
                    : (0, date_fns_1.addDays)(last, 30);
            return next >= now && next <= weekEnd;
        }).length;
        const pendingBookings = await Booking_model_1.default.countDocuments({ status: "pending" });
        res.json({
            totalActiveClients: activeClients.length,
            revenueThisMonth: revenueThisMonth[0]?.total || 0,
            outstandingBalance: outstanding[0]?.total || 0,
            upcomingThisWeek,
            pendingBookings,
        });
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getDashboardStats = getDashboardStats;
const getMonthlyRevenue = async (req, res) => {
    try {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const result = await Invoice_model_1.default.aggregate([
            { $match: { status: "paid", paidDate: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$paidDate" } } },
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const found = result.find((r) => r._id === key);
            return {
                month: d.toLocaleDateString("en-KE", { month: "short" }),
                revenue: found ? found.total : 0,
            };
        });
        res.json(months);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getMonthlyRevenue = getMonthlyRevenue;
//# sourceMappingURL=invoice.controller.js.map