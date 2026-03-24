import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import InvoicesPage from "./pages/InvoicesPage";
import SchedulePage from "./pages/SchedulePage";
import { useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7502/ingest/6374a321-2831-470e-87f4-74d51ee0d4d1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "94c943" },
      body: JSON.stringify({
        sessionId: "94c943",
        runId: "pre-fix",
        hypothesisId: "H6",
        location: "App.tsx:16",
        message: "App mounted",
        data: { hasWindow: typeof window !== "undefined" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, []);
  // #endregion

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;