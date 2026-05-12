import { User, Client, Invoice } from "@/types";
import { addDays, subDays, subMonths, format } from "date-fns";

const now = new Date();
const SEED_VERSION = "ke-v3";

export const seedUsers: User[] = [
  {
    id: "u1",
    email: "admin@sparkleclean.co.ke",
    name: "Admin User",
    role: "admin",
    createdAt: subMonths(now, 6).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "u2",
    email: "staff@sparkleclean.co.ke",
    name: "James Otieno",
    role: "staff",
    createdAt: subMonths(now, 3).toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const seedClients: Client[] = [
  {
    id: "c1",
    name: "Wanjiru Kamau",
    phone: "+254 712 345 678",
    email: "wanjiru.kamau@gmail.com",
    address: "Westlands, Nairobi",
    serviceType: "Standard",
    pricePerVisit: 3500,
    frequency: "weekly",
    lastCleanedDate: subDays(now, 5).toISOString(),
    status: "active",
    notes: "Has a guard dog — call before arriving",
    preferredDay: "Monday",
    createdBy: "u1",
    createdAt: subMonths(now, 4).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "c2",
    name: "Otieno Odhiambo",
    phone: "+254 723 456 789",
    email: "otieno@outlook.com",
    address: "Karen, Nairobi",
    serviceType: "Deep Clean",
    pricePerVisit: 7500,
    frequency: "biweekly",
    lastCleanedDate: subDays(now, 10).toISOString(),
    status: "active",
    notes: "Prefers cleaning on Saturdays",
    preferredDay: "Saturday",
    createdBy: "u1",
    createdAt: subMonths(now, 3).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "c3",
    name: "Fatuma Hassan",
    phone: "+254 733 567 890",
    email: "fatuma.hassan@yahoo.com",
    address: "Lavington, Nairobi",
    serviceType: "Move-In/Out",
    pricePerVisit: 12000,
    frequency: "monthly",
    lastCleanedDate: subDays(now, 28).toISOString(),
    status: "active",
    notes: "Gate code: 2024",
    preferredDay: "Friday",
    createdBy: "u1",
    createdAt: subMonths(now, 5).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "c4",
    name: "Kipchoge Mutai",
    phone: "+254 745 678 901",
    email: "kipchoge.mutai@gmail.com",
    address: "Kilimani, Nairobi",
    serviceType: "Deep Clean",
    pricePerVisit: 9000,
    frequency: "biweekly",
    lastCleanedDate: subDays(now, 12).toISOString(),
    status: "active",
    notes: "Two floors — extra time needed",
    preferredDay: "Wednesday",
    createdBy: "u2",
    createdAt: subMonths(now, 2).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "c5",
    name: "Aisha Mwangi",
    phone: "+254 756 789 012",
    email: "aisha.mwangi@gmail.com",
    address: "Runda, Nairobi",
    serviceType: "Standard",
    pricePerVisit: 4500,
    frequency: "weekly",
    lastCleanedDate: subDays(now, 6).toISOString(),
    status: "active",
    notes: "Has allergies — use fragrance-free products only",
    preferredDay: "Tuesday",
    createdBy: "u2",
    createdAt: subMonths(now, 1).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "c6",
    name: "David Kariuki",
    phone: "+254 767 890 123",
    email: "david.kariuki@gmail.com",
    address: "Gigiri, Nairobi",
    serviceType: "Move-In/Out",
    pricePerVisit: 15000,
    frequency: "monthly",
    lastCleanedDate: null,
    status: "active",
    notes: "New client — first visit pending. Large compound with swimming pool",
    preferredDay: "Thursday",
    createdBy: "u1",
    createdAt: subDays(now, 5).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "c7",
    name: "Njoroge Githuku",
    phone: "+254 778 901 234",
    email: "njoroge@gmail.com",
    address: "Kileleshwa, Nairobi",
    serviceType: "Standard",
    pricePerVisit: 3000,
    frequency: "weekly",
    lastCleanedDate: subDays(now, 6).toISOString(),
    status: "inactive",
    notes: "Service on hold until further notice",
    preferredDay: "Sunday",
    createdBy: "u1",
    createdAt: subMonths(now, 6).toISOString(),
    updatedAt: subDays(now, 30).toISOString(),
  },
  {
    id: "c8",
    name: "Amina Osman",
    phone: "+254 789 012 345",
    email: "amina.osman@gmail.com",
    address: "Parklands, Nairobi",
    serviceType: "Standard",
    pricePerVisit: 3800,
    frequency: "weekly",
    lastCleanedDate: subDays(now, 4).toISOString(),
    status: "active",
    notes: "Leave cleaning supplies in the utility room",
    preferredDay: "Monday",
    createdBy: "u1",
    createdAt: subMonths(now, 2).toISOString(),
    updatedAt: now.toISOString(),
  },
];

function generateInvoiceNumber(date: Date, index: number): string {
  return `SC-${format(date, "yyyyMM")}-${String(index).padStart(4, "0")}`;
}

export const seedInvoices: Invoice[] = [
  // Paid invoices across several months
  ...Array.from({ length: 12 }, (_, i) => {
    const date = subDays(now, 7 * (i + 1));
    const client = seedClients[i % 5];
    return {
      id: `inv-${i + 1}`,
      clientId: client.id,
      clientName: client.name,
      invoiceNumber: generateInvoiceNumber(date, i + 1),
      amount: client.pricePerVisit,
      dueDate: date.toISOString(),
      status: "paid" as const,
      paidDate: addDays(date, Math.floor(Math.random() * 5)).toISOString(),
      notes: "",
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };
  }),
  // Unpaid invoices
  {
    id: "inv-u1",
    clientId: "c1",
    clientName: "Wanjiru Kamau",
    invoiceNumber: generateInvoiceNumber(subDays(now, 5), 100),
    amount: 3500,
    dueDate: subDays(now, 5).toISOString(),
    status: "unpaid",
    paidDate: null,
    notes: "",
    createdAt: subDays(now, 5).toISOString(),
    updatedAt: subDays(now, 5).toISOString(),
  },
  {
    id: "inv-u2",
    clientId: "c2",
    clientName: "Otieno Odhiambo",
    invoiceNumber: generateInvoiceNumber(subDays(now, 10), 101),
    amount: 7500,
    dueDate: subDays(now, 10).toISOString(),
    status: "unpaid",
    paidDate: null,
    notes: "",
    createdAt: subDays(now, 10).toISOString(),
    updatedAt: subDays(now, 10).toISOString(),
  },
  {
    id: "inv-u3",
    clientId: "c4",
    clientName: "Kipchoge Mutai",
    invoiceNumber: generateInvoiceNumber(subDays(now, 12), 102),
    amount: 9000,
    dueDate: subDays(now, 12).toISOString(),
    status: "unpaid",
    paidDate: null,
    notes: "",
    createdAt: subDays(now, 12).toISOString(),
    updatedAt: subDays(now, 12).toISOString(),
  },
  {
    id: "inv-u4",
    clientId: "c5",
    clientName: "Aisha Mwangi",
    invoiceNumber: generateInvoiceNumber(subDays(now, 6), 103),
    amount: 4500,
    dueDate: subDays(now, 6).toISOString(),
    status: "unpaid",
    paidDate: null,
    notes: "",
    createdAt: subDays(now, 6).toISOString(),
    updatedAt: subDays(now, 6).toISOString(),
  },
];

export function initializeData() {
  // Clear old non-Kenyan data automatically
  const version = localStorage.getItem("seed-version");
  if (version !== SEED_VERSION) {
    localStorage.removeItem("sc_users");
    localStorage.removeItem("sc_clients");
    localStorage.removeItem("sc_invoices");
    localStorage.removeItem("clients");
    localStorage.removeItem("invoices");
    localStorage.setItem("seed-version", SEED_VERSION);
  }

  if (!localStorage.getItem("sc_users")) {
    localStorage.setItem("sc_users", JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem("sc_clients")) {
    localStorage.setItem("sc_clients", JSON.stringify(seedClients));
  }
  if (!localStorage.getItem("sc_invoices")) {
    localStorage.setItem("sc_invoices", JSON.stringify(seedInvoices));
  }
}