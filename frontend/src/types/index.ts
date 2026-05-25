export type UserRole = "admin" | "staff";
export type ServiceType = "Standard" | "Deep Clean" | "Move-In/Out" | "Other";
export type Frequency = "weekly" | "biweekly" | "monthly";
export type ClientStatus = "active" | "inactive";
export type InvoiceStatus = "unpaid" | "paid";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PreferredTime = "Morning 8am–12pm" | "Afternoon 12pm–4pm" | "Evening 4pm–8pm";

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
  preferredDay: 'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday';
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
  preferredTime: PreferredTime;
  frequency: "One-time Booking" | "Weekly" | "Bi-weekly" | "Monthly";
  propertyType: "Apartment" | "Maisonette" | "Bungalow" | "Villa" | "Office" | "Townhouse" | "Studio" | "Other";
  propertySize: "Studio / Bedsitter" | "1 Bedroom" | "2 Bedrooms" | "3 Bedrooms" | "4 Bedrooms" | "5+ Bedrooms" | "Large Commercial";
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}
