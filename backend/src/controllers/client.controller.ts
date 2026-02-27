import { Response } from 'express';
import Client from '../models/Client.model';
import { AuthRequest } from '../types';
import { calculateNextCleaning } from '../utils/scheduleUtils'; // We'll create this in step 6

export const getClients = async (req: AuthRequest, res: Response) => {
  const { search, frequency, serviceType, status } = req.query;

  const query: any = {};
  if (search) query.$text = { $search: search as string };
  if (frequency) query.frequency = { $in: (frequency as string).split(',') };
  if (serviceType) query.serviceType = { $in: (serviceType as string).split(',') };
  if (status) query.status = status;

  const clients = await Client.find(query).populate('createdBy', 'name');
  const clientsWithNext = clients.map((client) => ({
    ...client.toJSON(),
    nextCleaning: calculateNextCleaning(client),
  }));

  res.json(clientsWithNext);
};

export const getClient = async (req: AuthRequest, res: Response) => {
  const client = await Client.findById(req.params.id).populate('createdBy', 'name');
  if (!client) return res.status(404).json({ message: 'Client not found' });

  res.json({
    ...client.toJSON(),
    nextCleaning: calculateNextCleaning(client),
  });
};

export const createClient = async (req: AuthRequest, res: Response) => {
  const clientData = { ...req.body, createdBy: req.user!._id };
  const client = new Client(clientData);
  await client.save();
  res.status(201).json(client);
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json(client);
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json({ message: 'Client deleted' });
};