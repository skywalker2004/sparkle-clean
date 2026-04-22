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
    // #region agent log
    fetch('http://127.0.0.1:7740/ingest/61f89cf0-f17c-4d95-857d-435abcdb0592',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e34294'},body:JSON.stringify({sessionId:'e34294',runId:'pre-fix',hypothesisId:'H5',location:'frontend/src/contexts/AuthContext.tsx:16',message:'AuthProvider useEffect entered',data:{hasInitialUser:!!state.user,initialIsAuthenticated:state.isAuthenticated,initialIsLoading:state.isLoading},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7319/ingest/61f89cf0-f17c-4d95-857d-435abcdb0592',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9489ed'},body:JSON.stringify({sessionId:'9489ed',runId:'pre-fix',hypothesisId:'H2',location:'frontend/src/contexts/AuthContext.tsx:16',message:'AuthProvider session check started',data:{hasInitialUser:!!state.user,initialIsAuthenticated:state.isAuthenticated,initialIsLoading:state.isLoading},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    authApi.getSession().then(user => {
      // #region agent log
      fetch('http://127.0.0.1:7319/ingest/61f89cf0-f17c-4d95-857d-435abcdb0592',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9489ed'},body:JSON.stringify({sessionId:'9489ed',runId:'pre-fix',hypothesisId:'H2',location:'frontend/src/contexts/AuthContext.tsx:20',message:'AuthProvider session check resolved',data:{hasUser:!!user,userRole:user?.role ?? null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setState({ user, isAuthenticated: !!user, isLoading: false });
    }).catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7319/ingest/61f89cf0-f17c-4d95-857d-435abcdb0592',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9489ed'},body:JSON.stringify({sessionId:'9489ed',runId:'pre-fix',hypothesisId:'H2',location:'frontend/src/contexts/AuthContext.tsx:24',message:'AuthProvider session check rejected',data:{errorMessage:error instanceof Error ? error.message : 'unknown-error'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setState({ user: null, isAuthenticated: false, isLoading: false });
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
