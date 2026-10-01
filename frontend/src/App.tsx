import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicBookingRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const BookingConfirmPage = lazy(() => import("@/pages/BookingConfirmPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const BookingsAdminPage = lazy(() => import("@/pages/BookingsAdminPage"));

const routeFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    <div className="flex items-center gap-3 text-sm">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      Loading page…
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      staleTime: 5_000,  // 5 seconds instead of 30
      gcTime: 10 * 60 * 1000,  // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true  // Refetch when window regains focus
    } 
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={routeFallback}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              
              {/* Public booking routes - only non-authenticated users */}
              <Route element={<PublicBookingRoute />}>
                <Route path="/book" element={<BookingPage />} />
                <Route path="/book/confirm" element={<BookingConfirmPage />} />
              </Route>

              {/* Protected admin routes - only admins can access */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/bookings" element={<BookingsAdminPage />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
