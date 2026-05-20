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
  preferredTime: 'Morning 8am-12pm' | 'Afternoon 12pm-5pm' | 'Evening 5pm-8pm';
  frequency: 'One-time' | 'Weekly' | 'Biweekly' | 'Monthly';
  propertyType: 'Apartment' | 'House' | 'Office' | 'Shop' | 'Other';
  propertySize: 'Studio/1BR' | '2-3 Bedroom' | '4-5 Bedroom' | 'Large 6BR+' | 'Commercial Small' | 'Commercial Large';
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
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
      enum: ['Morning 8am-12pm', 'Afternoon 12pm-5pm', 'Evening 5pm-8pm'],
      required: true 
    },
    frequency: {
      type: String,
      enum: ['One-time', 'Weekly', 'Biweekly', 'Monthly'],
      default: 'One-time'
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'House', 'Office', 'Shop', 'Other'],
      required: true
    },
    propertySize: {
      type: String,
      enum: ['Studio/1BR', '2-3 Bedroom', '4-5 Bedroom', 'Large 6BR+', 'Commercial Small', 'Commercial Large'],
      required: true
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

BookingSchema.index({ phone: 'text', address: 'text', fullName: 'text' });

export default mongoose.model<IBooking>('Booking', BookingSchema);
