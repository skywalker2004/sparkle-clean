import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER: User = {
  id: "1", name: "Admin User",
  email: "admin@sparkleclean.com", role: "admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sc-user");
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    if (email === "admin@sparkleclean.com" && password === "Florida2026!") {
      setUser(DEMO_USER);
      localStorage.setItem("sc-user", JSON.stringify(DEMO_USER));
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sc-user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}