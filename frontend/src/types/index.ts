export type UserRole = "admin" | "staff";
export type ServiceType = "Standard" | "Deep Clean" | "Move-In/Out" | "Other";
export type Frequency = "weekly" | "biweekly" | "monthly";
export type ClientStatus = "active" | "inactive";
export type InvoiceStatus = "unpaid" | "paid";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PreferredTime = "Morning 8am-12pm" | "Afternoon 12pm-5pm" | "Evening 5pm-8pm";

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
  frequency: 'One-time' | 'Weekly' | 'Biweekly' | 'Monthly';
  propertyType: 'Apartment' | 'House' | 'Office' | 'Shop' | 'Other';
  propertySize: 'Studio/1BR' | '2-3 Bedroom' | '4-5 Bedroom' | 'Large 6BR+' | 'Commercial Small' | 'Commercial Large';
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

