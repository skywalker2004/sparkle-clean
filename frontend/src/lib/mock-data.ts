import { User, Client, Invoice } from "@/types";
import { addDays, subDays, subMonths, format } from "date-fns";

const now = new Date();

export const seedUsers: User[] = [
  {
    id: "u1",
    email: "admin@sparkleclean.com",
    name: "Maria Santos",
    role: "admin",
    createdAt: subMonths(now, 6).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "u2",
    email: "staff@sparkleclean.com",
    name: "Carlos Rivera",
    role: "staff",
    createdAt: subMonths(now, 3).toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const seedClients: Client[] = [
  {
    id: "c1", name: "Johnson Family", phone: "(305) 555-0101", email: "johnson@email.com",
    address: "1234 Ocean Drive, Miami, FL 33139", serviceType: "Standard", pricePerVisit: 150,
    frequency: "weekly", lastCleanedDate: subDays(now, 5).toISOString(), status: "active",
    notes: "Has two dogs, use pet-safe products", createdBy: "u1",
    createdAt: subMonths(now, 4).toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: "c2", name: "Garcia Residence", phone: "(786) 555-0202", email: "garcia@email.com",
    address: "5678 Brickell Ave, Miami, FL 33131", serviceType: "Deep Clean", pricePerVisit: 280,
    frequency: "biweekly", lastCleanedDate: subDays(now, 10).toISOString(), status: "active",
    notes: "3-story townhouse, bring extra supplies", createdBy: "u1",
    createdAt: subMonths(now, 3).toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: "c3", name: "Williams Condo", phone: "(954) 555-0303", email: "williams@email.com",
    address: "910 Las Olas Blvd, Fort Lauderdale, FL 33301", serviceType: "Standard", pricePerVisit: 120,
    frequency: "weekly", lastCleanedDate: subDays(now, 3).toISOString(), status: "active",
    notes: "Key under mat, alarm code 4521", createdBy: "u1",
    createdAt: subMonths(now, 5).toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: "c4", name: "Thompson Estate", phone: "(561) 555-0404", email: "thompson@email.com",
    address: "2200 Palm Beach Lakes, West Palm Beach, FL 33409", serviceType: "Deep Clean", pricePerVisit: 350,
    frequency: "monthly", lastCleanedDate: subDays(now, 25).toISOString(), status: "active",
    notes: "Large property, 5 bedrooms", createdBy: "u2",
    createdAt: subMonths(now, 2).toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: "c5", name: "Martinez Apartment", phone: "(305) 555-0505", email: "martinez@email.com",
    address: "3400 Coral Way, Miami, FL 33145", serviceType: "Standard", pricePerVisit: 100,
    frequency: "biweekly", lastCleanedDate: subDays(now, 12).toISOString(), status: "active",
    notes: "", createdBy: "u2",
    createdAt: subMonths(now, 1).toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: "c6", name: "Chen Family", phone: "(407) 555-0606", email: "chen@email.com",
    address: "7890 International Dr, Orlando, FL 32819", serviceType: "Move-In/Out", pricePerVisit: 400,
    frequency: "monthly", lastCleanedDate: null, status: "active",
    notes: "New client, first visit pending", createdBy: "u1",
    createdAt: subDays(now, 5).toISOString(), updatedAt: now.toISOString(),
  },
  {
    id: "c7", name: "Davis House", phone: "(813) 555-0707", email: "",
    address: "456 Bay Shore Blvd, Tampa, FL 33606", serviceType: "Standard", pricePerVisit: 130,
    frequency: "weekly", lastCleanedDate: subDays(now, 6).toISOString(), status: "inactive",
    notes: "On hold until March", createdBy: "u1",
    createdAt: subMonths(now, 6).toISOString(), updatedAt: subDays(now, 30).toISOString(),
  },
];

function generateInvoiceNumber(date: Date, index: number): string {
  return `INV-${format(date, "yyyyMM")}-${String(index).padStart(4, "0")}`;
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
    id: "inv-u1", clientId: "c1", clientName: "Johnson Family",
    invoiceNumber: generateInvoiceNumber(subDays(now, 5), 100),
    amount: 150, dueDate: subDays(now, 5).toISOString(), status: "unpaid",
    paidDate: null, notes: "", createdAt: subDays(now, 5).toISOString(), updatedAt: subDays(now, 5).toISOString(),
  },
  {
    id: "inv-u2", clientId: "c2", clientName: "Garcia Residence",
    invoiceNumber: generateInvoiceNumber(subDays(now, 10), 101),
    amount: 280, dueDate: subDays(now, 10).toISOString(), status: "unpaid",
    paidDate: null, notes: "", createdAt: subDays(now, 10).toISOString(), updatedAt: subDays(now, 10).toISOString(),
  },
  {
    id: "inv-u3", clientId: "c4", clientName: "Thompson Estate",
    invoiceNumber: generateInvoiceNumber(subDays(now, 25), 102),
    amount: 350, dueDate: subDays(now, 25).toISOString(), status: "unpaid",
    paidDate: null, notes: "", createdAt: subDays(now, 25).toISOString(), updatedAt: subDays(now, 25).toISOString(),
  },
];

export function initializeData() {
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
