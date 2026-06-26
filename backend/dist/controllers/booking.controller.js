"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.confirmBooking = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const Client_model_1 = __importDefault(require("../models/Client.model"));
const Invoice_model_1 = __importDefault(require("../models/Invoice.model"));
const date_fns_1 = require("date-fns");
const email_service_1 = require("../utils/email.service");
const generateBookingRef = () => {
    const rand = Math.random().toString().substring(2, 6);
    return `SC-BOOK-${rand}`;
};
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function mapServiceType(serviceName) {
    if (serviceName.toLowerCase().includes('deep'))
        return 'Deep Clean';
    if (serviceName.toLowerCase().includes('move'))
        return 'Move-In/Out';
    return 'Standard';
}
function mapFrequency(frequency) {
    if (frequency === 'Weekly')
        return 'weekly';
    if (frequency === 'Bi-weekly')
        return 'biweekly';
    if (frequency === 'Monthly')
        return 'monthly';
    return 'weekly';
}
function getPreferredDay(dateStr) {
    const dayIndex = new Date(dateStr).getDay();
    return DAY_NAMES[dayIndex];
}
async function convertBookingToClient(booking, userId) {
    if (booking.convertedToClient) {
        throw new Error('Booking already confirmed and client created');
    }
    const newClient = new Client_model_1.default({
        name: booking.fullName,
        phone: booking.phone,
        email: booking.email || '',
        address: booking.address,
        serviceType: mapServiceType(booking.serviceType),
        pricePerVisit: booking.totalPrice,
        frequency: mapFrequency(booking.frequency),
        status: 'active',
        notes: booking.notes || '',
        lastCleanedDate: null,
        preferredDay: getPreferredDay(booking.preferredDate),
        createdBy: userId,
        dateAdded: new Date(),
    });
    await newClient.save();
    const invoiceNumber = `SC-${Date.now()}`;
    const dueDate = (0, date_fns_1.addDays)(new Date(booking.preferredDate), 14);
    const newInvoice = new Invoice_model_1.default({
        invoiceNumber,
        client: newClient._id,
        clientName: booking.fullName,
        amount: booking.totalPrice,
        dueDate,
        status: 'unpaid',
        paidDate: null,
        notes: `Booking ref: ${booking.bookingRef}`,
    });
    await newInvoice.save();
    booking.status = 'confirmed';
    booking.convertedToClient = true;
    booking.clientId = newClient._id.toString();
    booking.invoiceId = newInvoice._id.toString();
    await booking.save();
    return { client: newClient, invoice: newInvoice, booking };
}
const createBooking = async (req, res) => {
    try {
        const { fullName, phone, email, address, serviceType, servicePrice, quantity = 1, preferredDate, preferredTime, frequency = 'One-time Booking', propertyType, propertySize, notes } = req.body;
        if (!fullName || !phone || !address || !serviceType || !servicePrice || !preferredDate || !preferredTime || !propertyType || !propertySize) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const bookingRef = generateBookingRef();
        const totalPrice = servicePrice * quantity;
        const booking = new Booking_model_1.default({
            bookingRef,
            fullName,
            phone,
            email,
            address,
            serviceType,
            servicePrice,
            quantity,
            totalPrice,
            preferredDate,
            preferredTime,
            frequency,
            propertyType,
            propertySize,
            notes,
            status: 'pending',
        });
        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
        void Promise.allSettled([
            savedBooking.email
                ? (0, email_service_1.sendClientConfirmationEmail)(savedBooking)
                : Promise.resolve(),
            (0, email_service_1.sendAdminNotificationEmail)(savedBooking),
        ]);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to create booking', error: error.message });
    }
};
exports.createBooking = createBooking;
const getBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const bookings = await Booking_model_1.default.find(query).sort({ createdAt: -1 });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
};
exports.getBookings = getBookings;
const getBooking = async (req, res) => {
    try {
        const booking = await Booking_model_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
    }
};
exports.getBooking = getBooking;
const confirmBooking = async (req, res) => {
    try {
        const booking = await Booking_model_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const result = await convertBookingToClient(booking, req.user._id.toString());
        res.json({
            message: 'Booking confirmed. Client and invoice created successfully.',
            client: result.client,
            invoice: result.invoice,
            booking: result.booking,
        });
    }
    catch (error) {
        if (error.message === 'Booking already confirmed and client created') {
            return res.status(400).json({ message: error.message });
        }
        console.error('confirmBooking error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.confirmBooking = confirmBooking;
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        if (status === 'confirmed') {
            const booking = await Booking_model_1.default.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            const result = await convertBookingToClient(booking, req.user._id.toString());
            return res.json({
                message: 'Booking confirmed. Client and invoice created successfully.',
                client: result.client,
                invoice: result.invoice,
                booking: result.booking,
            });
        }
        const booking = await Booking_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        if (error.message === 'Booking already confirmed and client created') {
            return res.status(400).json({ message: error.message });
        }
        console.error('updateBookingStatus error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateBookingStatus = updateBookingStatus;
//# sourceMappingURL=booking.controller.js.map