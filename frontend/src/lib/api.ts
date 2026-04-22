/**
 * API Service Layer — Stub implementation using localStorage.
 * Replace each function body with real fetch() calls to your Express backend.
 * Base URL: const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
 */

import { Client, Invoice, User, LoginCredentials, DashboardStats, MonthlyRevenue } from "@/types";
import { addDays, isWithinInterval, startOfMonth, endOfMonth, startOfDay, format, subMonths } from "date-fns";
import { initializeData } from "./mock-data";

// Initialize mock data on first load
initializeData();

function getClients(): Client[] {
  return JSON.parse(localStorage.getItem("sc_clients") || "[]");
}
function setClients(clients: Client[]) {
  localStorage.setItem("sc_clients", JSON.stringify(clients));
}
function getInvoices(): Invoice[] {
  return JSON.parse(localStorage.getItem("sc_invoices") || "[]");
}
function setInvoices(invoices: Invoice[]) {
  localStorage.setItem("sc_invoices", JSON.stringify(invoices));
}
function getUsers(): User[] {
  return JSON.parse(localStorage.getItem("sc_users") || "[]");
}

// Delay helper for realistic feel
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export function getNextCleaningDate(client: Client): Date | null {
  if (!client.lastCleanedDate) return null;
  const last = new Date(client.lastCleanedDate);
  const daysMap = { weekly: 7, biweekly: 14, monthly: 30 };
  return addDays(last, daysMap[client.frequency]);
}

// ── Auth ──
export const authApi = {
  async login(creds: LoginCredentials): Promise<User> {
    await delay(500);
    const users = getUsers();
    // Mock: accept any password for demo, in prod this hits your backend
    const user = users.find(u => u.email === creds.email);
    if (!user) throw new Error("Invalid email or password");
    // Store session
    localStorage.setItem("sc_session", JSON.stringify(user));
    return user;
  },
  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem("sc_session");
  },
  async getSession(): Promise<User | null> {
    await delay(100);
    const s = localStorage.getItem("sc_session");
    return s ? JSON.parse(s) : null;
  },
};

// ── Clients ──
export const clientsApi = {
  async list(): Promise<Client[]> {
    await delay();
    return getClients();
  },
  async getById(id: string): Promise<Client> {
    await delay();
    const c = getClients().find(c => c.id === id);
    if (!c) throw new Error("Client not found");
    return c;
  },
  async create(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
    await delay();
    const clients = getClients();
    const client: Client = {
      ...data,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(client);
    setClients(clients);
    return client;
  },
  async update(id: string, data: Partial<Client>): Promise<Client> {
    await delay();
    const clients = getClients();
    const idx = clients.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Client not found");
    clients[idx] = { ...clients[idx], ...data, updatedAt: new Date().toISOString() };
    setClients(clients);
    return clients[idx];
  },
  async remove(id: string): Promise<void> {
    await delay();
    setClients(getClients().filter(c => c.id !== id));
  },
};

// ── Invoices ──
export const invoicesApi = {
  async list(): Promise<Invoice[]> {
    await delay();
    return getInvoices();
  },
  async create(data: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
    await delay();
    const invoices = getInvoices();
    const invoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.push(invoice);
    setInvoices(invoices);
    return invoice;
  },
  async markPaid(ids: string[]): Promise<void> {
    await delay();
    const invoices = getInvoices();
    const now = new Date().toISOString();
    for (const inv of invoices) {
      if (ids.includes(inv.id)) {
        inv.status = "paid";
        inv.paidDate = now;
        inv.updatedAt = now;
      }
    }
    setInvoices(invoices);
  },
  async remove(id: string): Promise<void> {
    await delay();
    setInvoices(getInvoices().filter(i => i.id !== id));
  },
};

// ── Record Completed Cleaning ──
export async function recordCleaning(clientId: string, date: Date, notes: string): Promise<Invoice> {
  await delay(400);
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) throw new Error("Client not found");

  // Update lastCleanedDate
  await clientsApi.update(clientId, { lastCleanedDate: date.toISOString() });

  // Generate invoice number
  const invoices = getInvoices();
  const monthStr = format(date, "yyyyMM");
  const monthInvoices = invoices.filter(i => i.invoiceNumber.includes(monthStr));
  const nextNum = monthInvoices.length + 1;
  const invoiceNumber = `INV-${monthStr}-${String(nextNum).padStart(4, "0")}`;

  return invoicesApi.create({
    clientId: client.id,
    clientName: client.name,
    invoiceNumber,
    amount: client.pricePerVisit,
    dueDate: date.toISOString(),
    status: "unpaid",
    paidDate: null,
    notes,
  });
}

// ── Dashboard ──
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    await delay();
    const clients = getClients();
    const invoices = getInvoices();
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const activeClients = clients.filter(c => c.status === "active");

    const revenueThisMonth = invoices
      .filter(i => i.status === "paid" && i.paidDate &&
        isWithinInterval(new Date(i.paidDate), { start: monthStart, end: monthEnd }))
      .reduce((sum, i) => sum + i.amount, 0);

    const outstandingBalance = invoices
      .filter(i => i.status === "unpaid")
      .reduce((sum, i) => sum + i.amount, 0);

    const weekEnd = addDays(startOfDay(now), 7);
    const upcomingThisWeek = activeClients.filter(c => {
      const next = getNextCleaningDate(c);
      return next && isWithinInterval(next, { start: startOfDay(now), end: weekEnd });
    }).length;

    return { totalActiveClients: activeClients.length, revenueThisMonth, outstandingBalance, upcomingThisWeek };
  },
  async getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    await delay();
    const invoices = getInvoices();
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const revenue = invoices
        .filter(inv => inv.status === "paid" && inv.paidDate &&
          isWithinInterval(new Date(inv.paidDate), { start, end }))
        .reduce((sum, inv) => sum + inv.amount, 0);
      return { month: format(month, "MMM yyyy"), revenue };
    });
  },
};

// ── CSV Export ──
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? "")}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
