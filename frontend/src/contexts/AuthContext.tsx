import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, AuthState, LoginCredentials } from "@/types";
import { authApi } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });

  useEffect(() => {
    authApi.getSession().then((user: User | null) => {
      setState({ user, isAuthenticated: !!user, isLoading: false });
    });
  }, []);

  const login = useCallback(async (creds: LoginCredentials) => {
    const user = await authApi.login(creds);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}