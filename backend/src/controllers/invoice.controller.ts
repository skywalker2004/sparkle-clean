import { Response } from 'express';
import Invoice from '../models/Invoice.model';
import Client from '../models/Client.model';
import { AuthRequest } from '../types';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  const { status, month, client } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (client) query.client = client;
  if (month) {
    const [year, mon] = (month as string).split('-');
    const start = new Date(Number(year), Number(mon) - 1, 1);
    const end = new Date(Number(year), Number(mon), 0);
    query.dueDate = { $gte: start, $lte: end };
  }

  const invoices = await Invoice.find(query).populate('client', 'name');
  res.json(invoices);
};

export const markPaid = async (req: AuthRequest, res: Response) => {
  const { ids } = req.body; // Array of invoice IDs for bulk
  await Invoice.updateMany({ _id: { $in: ids } }, { status: 'paid', paidDate: new Date() });
  res.json({ message: 'Invoices marked as paid' });
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const activeClients = await Client.countDocuments({ status: 'active' });

  const revenueThisMonth = await Invoice.aggregate([
    { $match: { paidDate: { $gte: startOfMonth, $lte: endOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const outstanding = await Invoice.aggregate([
    { $match: { status: 'unpaid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const monthlyRevenueLast6 = await Invoice.aggregate([
    {
      $match: {
        paidDate: { $gte: new Date(now.setMonth(now.getMonth() - 6)) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    activeClients,
    revenueThisMonth: revenueThisMonth[0]?.total || 0,
    outstanding: outstanding[0]?.total || 0,
    monthlyRevenue: monthlyRevenueLast6,
  });
};