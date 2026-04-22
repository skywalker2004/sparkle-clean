import mongoose, { Schema } from 'mongoose';

interface IClient extends mongoose.Document {
  name: string;
  phone: string;
  email?: string;
  address: string;
  serviceType: string;
  pricePerVisit: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  lastCleanedDate?: Date;
  status: 'active' | 'inactive';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    serviceType: { type: String, enum: ['Standard', 'Deep Clean', 'Move-In/Out', 'Other'], required: true },
    pricePerVisit: { type: Number, required: true, min: 0 },
    frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], required: true },
    lastCleanedDate: { type: Date },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ClientSchema.index({ name: 'text', phone: 'text', address: 'text' }); // For search

export default mongoose.model<IClient>('Client', ClientSchema);