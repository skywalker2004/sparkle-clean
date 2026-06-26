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
  preferredDay?: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
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
  pendingBookings: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface Booking {
  id: string;
  bookingRef: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  serviceType: string;
  servicePrice: number;
  quantity: number;
  totalPrice: number;
  preferredDate: string;
  preferredTime: string;
  frequency: string;
  propertyType: string;
  propertySize: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  clientId?: string | null;
  invoiceId?: string | null;
  convertedToClient?: boolean;
  createdAt: string;
}