export type UserRole = "admin" | "staff";
export type ServiceType = "Standard" | "Deep Clean" | "Move-In/Out" | "Other";
export type Frequency = "weekly" | "biweekly" | "monthly";
export type ClientStatus = "active" | "inactive";
export type InvoiceStatus = "unpaid" | "paid";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceType: ServiceType;
  pricePerVisit: number;
  frequency: Frequency;
  lastCleanedDate: string | null;
  status: ClientStatus;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DashboardStats {
  totalActiveClients: number;
  revenueThisMonth: number;
  outstandingBalance: number;
  upcomingThisWeek: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}
