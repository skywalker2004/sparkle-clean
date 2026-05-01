"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.markPaid = exports.getInvoices = void 0;
const Invoice_model_1 = __importDefault(require("../models/Invoice.model"));
const Client_model_1 = __importDefault(require("../models/Client.model"));
const getInvoices = async (req, res) => {
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
    const invoices = await Invoice_model_1.default.find(query).populate('client', 'name');
    res.json(invoices);
};
exports.getInvoices = getInvoices;
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
        activeClients,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        outstanding: outstanding[0]?.total || 0,
        monthlyRevenue: monthlyRevenueLast6,
    });
};
exports.getDashboardStats = getDashboardStats;
