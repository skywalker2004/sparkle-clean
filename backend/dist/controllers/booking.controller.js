"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const generateBookingRef = () => {
    const rand = Math.random().toString().substring(2, 6);
    return `SC-BOOK-${rand}`;
};
const createBooking = async (req, res) => {
    try {
        const { fullName, phone, email, address, serviceType, servicePrice, quantity = 1, preferredDate, preferredTime, frequency = 'One-time Booking', propertyType, propertySize, notes } = req.body;
        // Validate required fields
        if (!fullName || !phone || !address || !serviceType || !servicePrice || !preferredDate || !preferredTime || !propertyType || !propertySize) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Generate booking reference
        const bookingRef = generateBookingRef();
        // Calculate total price
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
        await booking.save();
        res.status(201).json(booking);
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
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const booking = await Booking_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to update booking', error: error.message });
    }
};
exports.updateBookingStatus = updateBookingStatus;
//# sourceMappingURL=booking.controller.js.map