import { Response } from 'express';
import Booking from '../models/Booking.model';
import { AuthRequest } from '../types';

const generateBookingRef = (): string => {
  const rand = Math.random().toString().substring(2, 6);
  return `SC-BOOK-${rand}`;
};

export const createBooking = async (req: any, res: Response) => {
  try {
    const { 
      fullName, 
      phone, 
      email, 
      address, 
      serviceType, 
      servicePrice,
      quantity = 1,
      preferredDate, 
      preferredTime,
      frequency = 'One-time',
      propertyType,
      propertySize,
      notes 
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !address || !serviceType || !servicePrice || !preferredDate || !preferredTime || !propertyType || !propertySize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate booking reference
    const bookingRef = generateBookingRef();
    
    // Calculate total price
    const totalPrice = servicePrice * quantity;

    const booking = new Booking({
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
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create booking', error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

export const getBooking = async (req: any, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to update booking', error: error.message });
  }
};
