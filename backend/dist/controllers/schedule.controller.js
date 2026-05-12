"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeCleaning = exports.getUpcoming = void 0;
const Client_model_1 = __importDefault(require("../models/Client.model"));
const Invoice_model_1 = __importDefault(require("../models/Invoice.model"));
const scheduleUtils_1 = require("../utils/scheduleUtils");
const getUpcoming = async (req, res) => {
    const clients = await Client_model_1.default.find({ status: 'active' });
    const upcoming = clients
        .map((client) => ({
        client,
        nextCleaning: (0, scheduleUtils_1.calculateNextCleaning)(client),
    }))
        .filter((item) => {
        if (!item.nextCleaning)
            return false;
        const diff = (item.nextCleaning.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        return diff <= 7 && diff >= 0;
    })
        .sort((a, b) => a.nextCleaning.getTime() - b.nextCleaning.getTime());
    res.json(upcoming);
};
exports.getUpcoming = getUpcoming;
const completeCleaning = async (req, res) => {
    const { clientId, completedDate, notes } = req.body;
    const client = await Client_model_1.default.findById(clientId);
    if (!client)
        return res.status(404).json({ message: 'Client not found' });
    client.lastCleanedDate = new Date(completedDate);
    await client.save();
    // Auto-create invoice
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const invoice = new Invoice_model_1.default({
        client: client._id,
        clientName: client.name,
        invoiceNumber,
        amount: client.pricePerVisit,
        dueDate: new Date(completedDate),
        status: 'unpaid',
        notes,
    });
    await invoice.save();
    res.json({ message: 'Cleaning completed, invoice created', invoice });
};
exports.completeCleaning = completeCleaning;
