import express from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { createBooking, getBookings, getBooking, updateBookingStatus } from '../controllers/booking.controller';

const router = express.Router();

// POST is public - no authentication required
router.post('/', createBooking);

// All other routes require authentication
router.use(protect);

// GET all bookings - admin only
router.get('/', admin, getBookings);

// GET single booking - admin only
router.get('/:id', admin, getBooking);

// UPDATE booking status - admin only
router.put('/:id', admin, updateBookingStatus);

export default router;
