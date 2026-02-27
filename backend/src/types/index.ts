import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: 'admin' | 'staff';
  };
}

export interface ClientData {
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
}

export interface InvoiceData {
  client: Types.ObjectId;
  amount: number;
  dueDate: Date;
  notes?: string;
}

export interface CompleteCleaningData {
  clientId: string;
  completedDate: Date;
  notes?: string;
}