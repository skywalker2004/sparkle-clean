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
  try {
    const { clientId, completedDate, date, notes } = req.body;
    const cleaningDate = completedDate || date;

    if (!clientId) return res.status(400).json({ message: 'clientId is required' });
    if (!cleaningDate) return res.status(400).json({ message: 'date is required' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    client.lastCleanedDate = new Date(cleaningDate);
    await client.save();

    // Auto-create invoice
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const invoice = new Invoice({
      client: client._id,
      clientName: client.name,
      invoiceNumber,
      amount: client.pricePerVisit,
      dueDate: new Date(cleaningDate),
      status: 'unpaid',
      notes,
    });
    await invoice.save();

    res.json({ message: 'Cleaning completed, invoice created', invoice });
  } catch (error: any) {
    res.status(500).json({ message: 'Error recording cleaning', error: error.message });
  }
};