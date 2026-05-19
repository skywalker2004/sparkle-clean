"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClient = exports.getClients = void 0;
const Client_model_1 = __importDefault(require("../models/Client.model")); // FIXED: Use correct path (add .model if file is named Client.model.ts, but test without if renamed)
const scheduleUtils_1 = require("../utils/scheduleUtils");
const getClients = async (req, res) => {
    const { search, frequency, serviceType, status } = req.query;
    const query = {};
    if (search)
        query.$text = { $search: search };
    if (frequency)
        query.frequency = { $in: frequency.split(',') };
    if (serviceType)
        query.serviceType = { $in: serviceType.split(',') };
    if (status)
        query.status = status;
    const clients = await Client_model_1.default.find(query).populate('createdBy', 'name');
    const clientsWithNext = clients.map((client) => ({
        ...client.toJSON(),
        nextCleaning: (0, scheduleUtils_1.calculateNextCleaning)(client),
    }));
    res.json(clientsWithNext);
};
exports.getClients = getClients;
const getClient = async (req, res) => {
    const client = await Client_model_1.default.findById(req.params.id).populate('createdBy', 'name');
    if (!client)
        return res.status(404).json({ message: 'Client not found' });
    res.json({
        ...client.toJSON(),
        nextCleaning: (0, scheduleUtils_1.calculateNextCleaning)(client),
    });
};
exports.getClient = getClient;
const createClient = async (req, res) => {
    const clientData = { ...req.body, createdBy: req.user._id, dateAdded: new Date() };
    const client = new Client_model_1.default(clientData);
    await client.save();
    res.status(201).json(client);
};
exports.createClient = createClient;
const updateClient = async (req, res) => {
    const { name, phone, email, address, serviceType, pricePerVisit, frequency, lastCleanedDate, status, notes } = req.body;
    const updateData = { name, phone, email, address, serviceType, pricePerVisit, frequency, lastCleanedDate, status, notes };
    const client = await Client_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!client)
        return res.status(404).json({ message: 'Client not found' });
    res.json(client);
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    const client = await Client_model_1.default.findByIdAndDelete(req.params.id);
    if (!client)
        return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
};
exports.deleteClient = deleteClient;
//# sourceMappingURL=client.controller.js.map