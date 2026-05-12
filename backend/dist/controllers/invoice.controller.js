"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyRevenue = exports.getDashboardStats = exports.markPaid = exports.createInvoice = exports.getInvoices = void 0;
const Invoice_model_1 = __importDefault(require("../models/Invoice.model"));
const Client_model_1 = __importDefault(require("../models/Client.model"));
const getInvoices = async (req, res) => {
    try {
        const { status, month, client } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (client)
            query.client = client;
        if (month) {
            const [year, mon] = month.split('-');
            const start = new Date(Number(year), Number(mon) - 1, 1);
            const end = new Date(Number(year), Number(mon), 0);
            query.dueDate = { $gte: start, $lte: end };
        }
        const invoices = await Invoice_model_1.default.find(query).lean();
        res.json(invoices.map(inv => ({
            id: inv._id,
            ...inv,
        })));
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Failed to fetch invoices' });
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res) => {
    try {
        const { client, amount, dueDate, notes } = req.body;
        const clientDoc = await Client_model_1.default.findById(client);
        if (!clientDoc) {
            return res.status(404).json({ message: 'Client not found' });
        }
        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const invoice = new Invoice_model_1.default({
            client,
            clientName: clientDoc.name,
            invoiceNumber,
            amount,
            dueDate,
            status: 'unpaid',
            notes,
        });
        await invoice.save();
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Failed to create invoice' });
    }
};
exports.createInvoice = createInvoice;
const markPaid = async (req, res) => {
    const { ids } = req.body; // Array of invoice IDs for bulk
    await Invoice_model_1.default.updateMany({ _id: { $in: ids } }, { status: 'paid', paidDate: new Date() });
    res.json({ message: 'Invoices marked as paid' });
};
exports.markPaid = markPaid;
const getDashboardStats = async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const activeClients = await Client_model_1.default.countDocuments({ status: 'active' });
    const revenueThisMonth = await Invoice_model_1.default.aggregate([
        { $match: { paidDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const outstanding = await Invoice_model_1.default.aggregate([
        { $match: { status: 'unpaid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthlyRevenueLast6 = await Invoice_model_1.default.aggregate([
        {
            $match: {
                paidDate: { $gte: new Date(now.setMonth(now.getMonth() - 6)) },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
                total: { $sum: '$amount' },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    res.json({
        totalActiveClients: activeClients,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        outstandingBalance: outstanding[0]?.total || 0,
        upcomingThisWeek: 0,
        monthlyRevenue: monthlyRevenueLast6,
    });
};
exports.getDashboardStats = getDashboardStats;
const getMonthlyRevenue = async (req, res) => {
    const now = new Date();
    const monthlyRevenueLast6 = await Invoice_model_1.default.aggregate([
        {
            $match: {
                paidDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
                total: { $sum: '$amount' },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    res.json(monthlyRevenueLast6.map((item) => ({
        month: item._id,
        revenue: item.total,
    })));
};
exports.getMonthlyRevenue = getMonthlyRevenue;
