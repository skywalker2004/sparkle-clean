import type { LoginCredentials, User } from "../types";

type DashboardStats = {
  totalActiveClients: number;
};

type MonthlyRevenuePoint = {
  month: string;
  revenue: number;
};

export const authApi = {
  async getSession(): Promise<User | null> {
    return {
      id: "u_1",
      name: "Admin User",
      email: "admin@sparkleclean.com",
      role: "admin",
    };
  },
  async login(_creds: LoginCredentials): Promise<User> {
    return {
      id: "u_1",
      name: "Admin User",
      email: "admin@sparkleclean.com",
      role: "admin",
    };
  },
  async logout(): Promise<void> {
    return;
  },
};

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    return { totalActiveClients: 24 };
  },
  async getMonthlyRevenue(): Promise<MonthlyRevenuePoint[]> {
    return [
      { month: "Jan", revenue: 3000 },
      { month: "Feb", revenue: 4200 },
      { month: "Mar", revenue: 5100 },
      { month: "Apr", revenue: 4800 },
      { month: "May", revenue: 6200 },
      { month: "Jun", revenue: 7000 },
    ];
  },
};

export function getNextCleaningDate(): Date {
  const next = new Date();
  next.setDate(next.getDate() + 2);
  return next;
}
