export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceType: "Standard" | "Deep Clean" | "Move-In/Out" | "Other";
  pricePerVisit: number;
  frequency: "weekly" | "biweekly" | "monthly";
  status: "active" | "inactive";
  notes: string;
  lastCleanedDate: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid";
  paidDate: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalActiveClients: number;
  revenueThisMonth: number;
  outstandingBalance: number;
  upcomingThisWeek: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
}