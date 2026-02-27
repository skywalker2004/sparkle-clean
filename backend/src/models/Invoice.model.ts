import mongoose, { Schema } from 'mongoose';

interface IInvoice extends mongoose.Document {
  client: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: 'unpaid' | 'paid';
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paidDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ client: 1, dueDate: -1 }); // For queries

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);