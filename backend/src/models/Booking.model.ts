import mongoose, { Schema } from 'mongoose';

interface IBooking extends mongoose.Document {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  serviceType: 'Standard' | 'Deep Clean' | 'Move-In/Out' | 'Other';
  preferredDate: Date;
  preferredTime: 'Morning 8am-12pm' | 'Afternoon 12pm-5pm' | 'Evening 5pm-8pm';
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingRef: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    serviceType: { 
      type: String, 
      enum: ['Standard', 'Deep Clean', 'Move-In/Out', 'Other'], 
      required: true 
    },
    preferredDate: { type: Date, required: true },
    preferredTime: { 
      type: String, 
      enum: ['Morning 8am-12pm', 'Afternoon 12pm-5pm', 'Evening 5pm-8pm'], 
      required: true 
    },
    notes: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'cancelled'], 
      default: 'pending' 
    },
    bookingRef: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
