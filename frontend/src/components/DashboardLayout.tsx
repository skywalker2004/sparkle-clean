import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, CalendarDays, LogOut, Sparkles, Loader2, Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
];

function AppSidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={`h-screen bg-card border-r border-border transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-xl tracking-tight">SparkleClean</span>}
      </div>

      <div className="p-3 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.title}
            href={item.url}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted text-sm font-medium text-sidebar-foreground"
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span>{item.title}</span>}
          </a>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0] || "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          )}
          <button onClick={logout} className="ml-auto text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-14 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Search clients or invoices..." 
          className="bg-muted border border-border rounded-lg px-4 py-2 w-80 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="p-2 rounded-lg hover:bg-muted"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold">
            {user?.name?.[0] || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto p-8 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="px-6 py-3 text-xs text-muted-foreground border-t border-border text-center bg-card">
          Data backed up automatically · SparkleClean © 2026
        </footer>
      </div>
    </div>
  );
}