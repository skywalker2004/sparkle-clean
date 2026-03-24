import { Response } from 'express';
import Client from '../models/Client.model';
import Invoice from '../models/Invoice.model';
import { AuthRequest } from '../types';
import { calculateNextCleaning } from '../utils/scheduleUtils';

export const getUpcoming = async (req: AuthRequest, res: Response) => {
  const clients = await Client.find({ status: 'active' });
  const upcoming = clients
    .map((client) => ({
      client,
      nextCleaning: calculateNextCleaning(client),
    }))
    .filter((item) => {
      if (!item.nextCleaning) return false;
      const diff = (item.nextCleaning.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diff <= 7 && diff >= 0;
    })
    .sort((a, b) => a.nextCleaning!.getTime() - b.nextCleaning!.getTime());

  res.json(upcoming);
};

export const completeCleaning = async (req: AuthRequest, res: Response) => {
  const { clientId, completedDate, notes } = req.body;

  const client = await Client.findById(clientId);
  if (!client) return res.status(404).json({ message: 'Client not found' });

  client.lastCleanedDate = new Date(completedDate);
  await client.save();

  // Auto-create invoice
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const invoice = new Invoice({
    client: client._id,
    invoiceNumber,
    amount: client.pricePerVisit,
    dueDate: new Date(completedDate),
    status: 'unpaid',
    notes,
  });
  await invoice.save();

  res.json({ message: 'Cleaning completed, invoice created', invoice });
};