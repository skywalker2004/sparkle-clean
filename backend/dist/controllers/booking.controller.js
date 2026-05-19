"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const generateBookingRef = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SC-BOOK-${timestamp}${random}`;
};
const createBooking = async (req, res) => {
    try {
        const { fullName, phone, email, address, serviceType, preferredDate, preferredTime, notes } = req.body;
        // Generate booking reference
        const bookingRef = generateBookingRef();
        const booking = new Booking_model_1.default({
            fullName,
            phone,
            email,
            address,
            serviceType,
            preferredDate: new Date(preferredDate),
            preferredTime,
            notes,
            bookingRef,
            status: 'pending',
        });
        await booking.save();
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to create booking', error });
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
        res.status(500).json({ message: 'Failed to fetch bookings', error });
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
        res.status(500).json({ message: 'Failed to fetch booking', error });
    }
};
exports.getBooking = getBooking;
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to update booking', error });
    }
};
exports.updateBookingStatus = updateBookingStatus;
//# sourceMappingURL=booking.controller.js.map