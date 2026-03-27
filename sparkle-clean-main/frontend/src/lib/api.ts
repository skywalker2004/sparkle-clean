import { addDays, addWeeks, addMonths, startOfDay, isWithinInterval } from "date-fns";
import { Client, Invoice, DashboardStats } from "@/types";

/* ── localStorage helpers ─────────────────────────── */
const ls = {
  get: <T>(key: string, def: T): T => {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : def;
    } catch {
      return def;
    }
  },
  set: <T>(key: string, v: T) => localStorage.setItem(key, JSON.stringify(v)),
};

/* ── Seed demo data on first load ─────────────────── */
function seed() {
  if (ls.get<Client[]>("clients", []).length > 0) return;
  const now = Date.now();
  const clients: Client[] = [
    {
      id: "1", name: "Maria Garcia", phone: "(305) 555-0101",
      email: "maria@example.com", address: "123 Ocean Drive, Miami Beach, FL",
      serviceType: "Standard", pricePerVisit: 150, frequency: "weekly",
      status: "active", notes: "Has two cats",
      lastCleanedDate: new Date(now - 7 * 864e5).toISOString(),
      createdBy: "admin", createdAt: new Date(now - 30 * 864e5).toISOString(),
    },
    {
      id: "2", name: "James Wilson", phone: "(305) 555-0202",
      email: "james@example.com", address: "456 Brickell Ave, Miami, FL",
      serviceType: "Deep Clean", pricePerVisit: 250, frequency: "biweekly",
      status: "active", notes: "",
      lastCleanedDate: new Date(now - 14 * 864e5).toISOString(),
      createdBy: "admin", createdAt: new Date(now - 20 * 864e5).toISOString(),
    },
    {
      id: "3", name: "Sofia Mendez", phone: "(786) 555-0303",
      email: "sofia@example.com", address: "789 Coral Way, Coral Gables, FL",
      serviceType: "Move-In/Out", pricePerVisit: 350, frequency: "monthly",
      status: "active", notes: "Key under mat",
      lastCleanedDate: new Date(now - 28 * 864e5).toISOString(),
      createdBy: "admin", createdAt: new Date(now - 60 * 864e5).toISOString(),
    },
  ];
  ls.set("clients", clients);

  const invoices: Invoice[] = clients.map((c, i) => ({
    id: String(i + 1),
    invoiceNumber: `INV-${String(i + 1).padStart(4, "0")}`,
    clientName: c.name, clientId: c.id,
    amount: c.pricePerVisit,
    dueDate: new Date(now + 7 * 864e5).toISOString(),
    status: i === 0 ? "paid" : "unpaid",
    paidDate: i === 0 ? new Date(now - 2 * 864e5).toISOString() : null,
    createdAt: new Date(now - (10 - i) * 864e5).toISOString(),
  }));
  ls.set("invoices", invoices);
}

/* ── Utilities ────────────────────────────────────── */
export function getNextCleaningDate(client: Client): Date | null {
  if (!client.lastCleanedDate) return null;
  const last = new Date(client.lastCleanedDate);
  if (client.frequency === "weekly") return addWeeks(last, 1);
  if (client.frequency === "biweekly") return addWeeks(last, 2);
  return addMonths(last, 1);
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","));
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob), download: filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── clientsApi ───────────────────────────────────── */
export const clientsApi = {
  list: async (): Promise<Client[]> => { seed(); return ls.get<Client[]>("clients", []); },

  create: async (data: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    const clients = ls.get<Client[]>("clients", []);
    const c: Client = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    ls.set("clients", [...clients, c]);
    return c;
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const clients = ls.get<Client[]>("clients", []).map(c => c.id === id ? { ...c, ...data } : c);
    ls.set("clients", clients);
    return clients.find(c => c.id === id)!;
  },

  remove: async (id: string): Promise<void> => {
    ls.set("clients", ls.get<Client[]>("clients", []).filter(c => c.id !== id));
    ls.set("invoices", ls.get<Invoice[]>("invoices", []).filter(i => i.clientId !== id));
  },
};

/* ── invoicesApi ──────────────────────────────────── */
export const invoicesApi = {
  list: async (): Promise<Invoice[]> => ls.get<Invoice[]>("invoices", []),

  markPaid: async (ids: string[]): Promise<void> => {
    const invoices = ls.get<Invoice[]>("invoices", []).map(i =>
      ids.includes(i.id) ? { ...i, status: "paid" as const, paidDate: new Date().toISOString() } : i
    );
    ls.set("invoices", invoices);
  },
};

/* ── recordCleaning ───────────────────────────────── */
export async function recordCleaning(clientId: string, date: Date, notes: string): Promise<void> {
  const clients = ls.get<Client[]>("clients", []);
  const client = clients.find(c => c.id === clientId);
  if (!client) throw new Error("Client not found");

  ls.set("clients", clients.map(c =>
    c.id === clientId ? { ...c, lastCleanedDate: date.toISOString(), notes: notes || c.notes } : c
  ));

  const invoices = ls.get<Invoice[]>("invoices", []);
  const num = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
  ls.set("invoices", [...invoices, {
    id: crypto.randomUUID(), invoiceNumber: num,
    clientName: client.name, clientId,
    amount: client.pricePerVisit,
    dueDate: addDays(date, 14).toISOString(),
    status: "unpaid", paidDate: null,
    createdAt: new Date().toISOString(),
  } satisfies Invoice]);
}

/* ── dashboardApi ─────────────────────────────────── */
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    seed();
    const clients = ls.get<Client[]>("clients", []);
    const invoices = ls.get<Invoice[]>("invoices", []);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekEnd = addDays(startOfDay(now), 7);

    return {
      totalActiveClients: clients.filter(c => c.status === "active").length,
      revenueThisMonth: invoices
        .filter(i => i.status === "paid" && i.paidDate && new Date(i.paidDate) >= monthStart)
        .reduce((s, i) => s + i.amount, 0),
      outstandingBalance: invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + i.amount, 0),
      upcomingThisWeek: clients.filter(c => c.status === "active").map(getNextCleaningDate)
        .filter((d): d is Date => !!d && isWithinInterval(d, { start: startOfDay(now), end: weekEnd })).length,
    };
  },

  getMonthlyRevenue: async (): Promise<{ month: string; revenue: number }[]> => {
    const invoices = ls.get<Invoice[]>("invoices", []);
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }),
        revenue: invoices
          .filter(inv => inv.status === "paid" && inv.paidDate &&
            new Date(inv.paidDate) >= start && new Date(inv.paidDate) <= end)
          .reduce((s, inv) => s + inv.amount, 0),
      };
    });
  },
};