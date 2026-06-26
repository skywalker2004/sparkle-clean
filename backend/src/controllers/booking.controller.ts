import { Response } from 'express';
import Booking from '../models/Booking.model';
import Client from '../models/Client.model';
import Invoice from '../models/Invoice.model';
import { AuthRequest } from '../types';
import { addDays } from 'date-fns';
import { sendClientConfirmationEmail, sendAdminNotificationEmail } from '../utils/email.service';

const generateBookingRef = (): string => {
  const rand = Math.random().toString().substring(2, 6);
  return `SC-BOOK-${rand}`;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

function mapServiceType(serviceName: string): 'Standard' | 'Deep Clean' | 'Move-In/Out' {
  if (serviceName.toLowerCase().includes('deep')) return 'Deep Clean';
  if (serviceName.toLowerCase().includes('move')) return 'Move-In/Out';
  return 'Standard';
}

function mapFrequency(frequency: string): 'weekly' | 'biweekly' | 'monthly' {
  if (frequency === 'Weekly') return 'weekly';
  if (frequency === 'Bi-weekly') return 'biweekly';
  if (frequency === 'Monthly') return 'monthly';
  return 'weekly';
}

function getPreferredDay(dateStr: string): typeof DAY_NAMES[number] {
  const dayIndex = new Date(dateStr).getDay();
  return DAY_NAMES[dayIndex];
}

async function convertBookingToClient(booking: InstanceType<typeof Booking>, userId: string) {
  if (booking.convertedToClient) {
    throw new Error('Booking already confirmed and client created');
  }

  const newClient = new Client({
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
  const dueDate = addDays(new Date(booking.preferredDate), 14);

  const newInvoice = new Invoice({
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
      frequency = 'One-time Booking',
      propertyType,
      propertySize,
      notes 
    } = req.body;

    if (!fullName || !phone || !address || !serviceType || !servicePrice || !preferredDate || !preferredTime || !propertyType || !propertySize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bookingRef = generateBookingRef();
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
    
    const savedBooking = await booking.save();

    res.status(201).json(savedBooking);

    void Promise.allSettled([
      savedBooking.email
        ? sendClientConfirmationEmail(savedBooking)
        : Promise.resolve(),
      sendAdminNotificationEmail(savedBooking),
    ]);
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

export const confirmBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const result = await convertBookingToClient(booking, req.user!._id.toString());

    res.json({
      message: 'Booking confirmed. Client and invoice created successfully.',
      client: result.client,
      invoice: result.invoice,
      booking: result.booking,
    });
  } catch (error: any) {
    if (error.message === 'Booking already confirmed and client created') {
      return res.status(400).json({ message: error.message });
    }
    console.error('confirmBooking error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'confirmed') {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      const result = await convertBookingToClient(booking, req.user!._id.toString());

      return res.json({
        message: 'Booking confirmed. Client and invoice created successfully.',
        client: result.client,
        invoice: result.invoice,
        booking: result.booking,
      });
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
    if (error.message === 'Booking already confirmed and client created') {
      return res.status(400).json({ message: error.message });
    }
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};
