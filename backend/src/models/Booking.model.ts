import mongoose, { Schema } from 'mongoose';

export interface IBooking extends mongoose.Document {
  bookingRef: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  serviceType: string;
  servicePrice: number;
  quantity: number;
  totalPrice: number;
  preferredDate: string;
  preferredTime: 'Morning 8am–12pm' | 'Afternoon 12pm–4pm' | 'Evening 4pm–8pm';
  frequency: 'One-time Booking' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  propertyType: 'Apartment' | 'Maisonette' | 'Bungalow' | 'Villa' | 'Office' | 'Townhouse' | 'Studio' | 'Other';
  propertySize: 'Studio / Bedsitter' | '1 Bedroom' | '2 Bedrooms' | '3 Bedrooms' | '4 Bedrooms' | '5+ Bedrooms' | 'Large Commercial';
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  clientId?: string | null;
  invoiceId?: string | null;
  convertedToClient: boolean;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    bookingRef: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    serviceType: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    preferredDate: { type: String, required: true },
    preferredTime: { 
      type: String, 
      enum: ['Morning 8am–12pm', 'Afternoon 12pm–4pm', 'Evening 4pm–8pm'],
      required: true 
    },
    frequency: {
      type: String,
      enum: ['One-time Booking', 'Weekly', 'Bi-weekly', 'Monthly'],
      default: 'One-time Booking'
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'Maisonette', 'Bungalow', 'Villa', 'Office', 'Townhouse', 'Studio', 'Other'],
      required: true
    },
    propertySize: {
      type: String,
      enum: ['Studio / Bedsitter', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms', 'Large Commercial'],
      required: true
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    clientId: { type: String, default: null },
    invoiceId: { type: String, default: null },
    convertedToClient: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

BookingSchema.index({ phone: 'text', address: 'text', fullName: 'text' });

export default mongoose.model<IBooking>('Booking', BookingSchema);
