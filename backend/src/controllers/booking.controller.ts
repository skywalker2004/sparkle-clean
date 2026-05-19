import { Response } from 'express';
import Booking from '../models/Booking.model';
import { AuthRequest } from '../types';

const generateBookingRef = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SC-BOOK-${timestamp}${random}`;
};

export const createBooking = async (req: any, res: Response) => {
  try {
    const { fullName, phone, email, address, serviceType, preferredDate, preferredTime, notes } = req.body;
    
    // Generate booking reference
    const bookingRef = generateBookingRef();
    
    const booking = new Booking({
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
  } catch (error) {
    res.status(400).json({ message: 'Failed to create booking', error });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error });
  }
};

export const getBooking = async (req: any, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update booking', error });
  }
};
