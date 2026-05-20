import { addWeeks, addMonths } from "date-fns";
import { Client, Invoice, DashboardStats, MonthlyRevenue, User, LoginCredentials, Booking } from "@/types";

const BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("sc-token");

const h = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const authApi = {
  async login(creds: LoginCredentials): Promise<User> {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    if (!res.ok) throw new Error("Invalid email or password");
    const data = await res.json();
    localStorage.setItem("sc-token", data.token);
    localStorage.setItem("sc-user", JSON.stringify(data.user));
    return data.user;
  },
  async logout(): Promise<void> {
    localStorage.removeItem("sc-token");
    localStorage.removeItem("sc-user");
  },
  async getSession(): Promise<User | null> {
    const s = localStorage.getItem("sc-user");
    return s ? JSON.parse(s) : null;
  },
};

export const clientsApi = {
  async list(): Promise<Client[]> {
    const res = await fetch(`${BASE}/clients`, { headers: h() });
    if (!res.ok) throw new Error("Failed to fetch clients");
    const data = await res.json();
    return data.map((c: any) => ({ ...c, id: c._id }));
  },
  async getById(id: string): Promise<Client> {
    const res = await fetch(`${BASE}/clients/${id}`, { headers: h() });
    if (!res.ok) throw new Error("Client not found");
    const c = await res.json();
    return { ...c, id: c._id };
  },
  async create(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
    const res = await fetch(`${BASE}/clients`, {
      method: "POST", headers: h(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create client");
    const c = await res.json();
    return { ...c, id: c._id };
  },
  async update(id: string, data: Partial<Client>): Promise<Client> {
    const res = await fetch(`${BASE}/clients/${id}`, {
      method: "PUT", headers: h(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update client");
    const c = await res.json();
    return { ...c, id: c._id };
  },
  async remove(id: string): Promise<void> {
    await fetch(`${BASE}/clients/${id}`, { method: "DELETE", headers: h() });
  },
};

export const invoicesApi = {
  async list(): Promise<Invoice[]> {
    const res = await fetch(`${BASE}/invoices`, { headers: h() });
    if (!res.ok) throw new Error("Failed to fetch invoices");
    const data = await res.json();
    return data.map((i: any) => ({ ...i, id: i._id }));
  },
  async create(data: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
    const res = await fetch(`${BASE}/invoices`, {
      method: "POST", headers: h(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create invoice");
    const i = await res.json();
    return { ...i, id: i._id };
  },
  async markPaid(ids: string[]): Promise<void> {
    await fetch(`${BASE}/invoices/mark-paid`, {
      method: "PUT", headers: h(), body: JSON.stringify({ ids }),
    });
  },
  async markUnpaid(ids: string[]): Promise<void> {
    await fetch(`${BASE}/invoices/mark-unpaid`, {
      method: "PUT", headers: h(), body: JSON.stringify({ ids }),
    });
  },
  async remove(id: string): Promise<void> {
    await fetch(`${BASE}/invoices/${id}`, { method: "DELETE", headers: h() });
  },
};

export async function recordCleaning(clientId: string, date: Date, notes: string): Promise<Invoice> {
  const res = await fetch(`${BASE}/invoices/record-cleaning`, {
    method: "POST", headers: h(),
    body: JSON.stringify({ clientId, date: date.toISOString(), notes }),
  });
  if (!res.ok) throw new Error("Failed to record cleaning");
  const i = await res.json();
  return { ...i, id: i._id };
}

export const bookingsApi = {
  async create(data: Omit<Booking, "id" | "status" | "bookingRef" | "createdAt">): Promise<Booking> {
    const res = await fetch(`${BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create booking");
    const b = await res.json();
    return { ...b, id: b._id };
  },
  async list(): Promise<Booking[]> {
    const res = await fetch(`${BASE}/bookings`, { headers: h() });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    const data = await res.json();
    return data.map((b: any) => ({ ...b, id: b._id }));
  },
  async getById(id: string): Promise<Booking> {
    const res = await fetch(`${BASE}/bookings/${id}`, { headers: h() });
    if (!res.ok) throw new Error("Booking not found");
    const b = await res.json();
    return { ...b, id: b._id };
  },
  async updateStatus(id: string, status: string): Promise<Booking> {
    const res = await fetch(`${BASE}/bookings/${id}/status`, {
      method: "PUT",
      headers: h(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update booking");
    const b = await res.json();
    return { ...b, id: b._id };
  },
};

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE}/invoices/dashboard-stats`, { headers: h() });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
  async getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    const res = await fetch(`${BASE}/invoices/monthly-revenue`, { headers: h() });
    if (!res.ok) throw new Error("Failed to fetch revenue");
    return res.json();
  },
};

export function getNextCleaningDate(client: Client): Date | null {
  if (!client.lastCleanedDate) return null;
  const last = new Date(client.lastCleanedDate);
  if (client.frequency === "weekly") return addWeeks(last, 1);
  if (client.frequency === "biweekly") return addWeeks(last, 2);
  return addMonths(last, 1);
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${String(row[k] ?? "")}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
  URL.revokeObjectURL(a.href);
}