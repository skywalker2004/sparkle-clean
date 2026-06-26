import { Response } from "express";
import Invoice from "../models/Invoice.model";
import Client from "../models/Client.model";
import Booking from "../models/Booking.model";
import { AuthRequest } from "../types";
import { addDays } from "date-fns";

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { status, month, client } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (client) query.clientId = client;
    if (month) {
      const [year, mon] = (month as string).split("-");
      const start = new Date(Number(year), Number(mon) - 1, 1);
      const end = new Date(Number(year), Number(mon), 0);
      query.dueDate = { $gte: start, $lte: end };
    }
    const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();
    res.json(invoices.map(inv => ({ ...inv, id: inv._id })));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, amount, dueDate, notes } = req.body;
    const clientDoc = await Client.findById(clientId);
    if (!clientDoc) return res.status(404).json({ message: "Client not found" });

    const count = await Invoice.countDocuments();
    const invoiceNumber = `SC-${String(count + 1).padStart(4, "0")}`;

    const invoice = new Invoice({
      clientId,
      clientName: clientDoc.name,
      invoiceNumber,
      amount,
      dueDate,
      status: "unpaid",
      paidDate: null,
      notes,
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
};

export const markPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    await Invoice.updateMany(
      { _id: { $in: ids } },
      { status: "paid", paidDate: new Date() }
    );
    res.json({ message: "Invoices marked as paid" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const markUnpaid = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    await Invoice.updateMany(
      { _id: { $in: ids } },
      { status: "unpaid", paidDate: null }
    );
    res.json({ message: "Invoices reversed to unpaid" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const recordCleaning = async (req: AuthRequest, res: Response) => {
  try {
    console.log("recordCleaning req.body:", req.body);
    const { clientId, date, notes } = req.body;

    console.log("Searching for clientId:", clientId);
    const client = await Client.findById(clientId);
    console.log("Client found:", client ? { id: client._id, name: client.name } : null);

    if (!client) return res.status(404).json({ message: "Client not found" });

    client.lastCleanedDate = new Date(date);
    if (notes) client.notes = notes;
    await client.save();

    const invoiceNumber = `SC-${Date.now()}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      client: client._id,
      clientName: client.name,
      amount: client.pricePerVisit,
      dueDate: addDays(new Date(date), 14),
      status: "unpaid",
      paidDate: null,
      notes: notes || "",
    });

    res.status(201).json({ ...invoice.toJSON(), id: invoice._id });
  } catch (error: any) {
    console.error("recordCleaning error:", error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const weekEnd = addDays(now, 7);

    const activeClients = await Client.find({ status: "active" });

    const revenueThisMonth = await Invoice.aggregate([
      { $match: { status: "paid", paidDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const outstanding = await Invoice.aggregate([
      { $match: { status: "unpaid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const upcomingThisWeek = activeClients.filter(c => {
      if (!c.lastCleanedDate || c.status !== "active") return false;
      const last = new Date(c.lastCleanedDate);
      const next = c.frequency === "weekly"
        ? addDays(last, 7)
        : c.frequency === "biweekly"
        ? addDays(last, 14)
        : addDays(last, 30);
      return next >= now && next <= weekEnd;
    }).length;

    const pendingBookings = await Booking.countDocuments({ status: "pending" });

    res.json({
      totalActiveClients: activeClients.length,
      revenueThisMonth: revenueThisMonth[0]?.total || 0,
      outstandingBalance: outstanding[0]?.total || 0,
      upcomingThisWeek,
      pendingBookings,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMonthlyRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const result = await Invoice.aggregate([
      { $match: { status: "paid", paidDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$paidDate" } } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = result.find((r: any) => r._id === key);
      return {
        month: d.toLocaleDateString("en-KE", { month: "short" }),
        revenue: found ? found.total : 0,
      };
    });

    res.json(months);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};