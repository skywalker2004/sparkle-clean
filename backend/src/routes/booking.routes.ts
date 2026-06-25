import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { createBooking, getBookings, getBooking, updateBookingStatus } from '../controllers/booking.controller';

const router = express.Router();

// POST is public - no authentication required
router.post('/', createBooking);

// All other routes require authentication
router.use(protect);

// GET all bookings - admin only
router.get('/', adminOnly, getBookings);

// GET single booking - admin only
router.get('/:id', adminOnly, getBooking);

// UPDATE booking status - admin only
router.put('/:id/status', adminOnly, updateBookingStatus);

export default router;
