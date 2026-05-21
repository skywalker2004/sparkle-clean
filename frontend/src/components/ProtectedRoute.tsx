import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (admin and staff both have access, but only admin for admin pages)
  if (requiredRole && requiredRole === "admin" && user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicBookingRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated as admin, redirect to dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
