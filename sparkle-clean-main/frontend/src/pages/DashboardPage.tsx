import { useQuery } from "@tanstack/react-query";
import { dashboardApi, getNextCleaningDate, clientsApi, recordCleaning } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, AlertCircle, CalendarDays, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { format, isWithinInterval, startOfDay, addDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@/types";
import { motion } from "framer-motion";

const statCards: Array<{ key: keyof import("@/types").DashboardStats; label: string; icon: typeof Users; gradient: string; isMoney?: boolean }> = [
  { key: "totalActiveClients", label: "Active Clients", icon: Users, gradient: "gradient-card-1" },
  { key: "revenueThisMonth", label: "Revenue This Month", icon: DollarSign, gradient: "gradient-card-2", isMoney: true },
  { key: "outstandingBalance", label: "Outstanding", icon: AlertCircle, gradient: "gradient-card-3", isMoney: true },
  { key: "upcomingThisWeek", label: "Upcoming This Week", icon: CalendarDays, gradient: "gradient-card-4" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const qc = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: dashboardApi.getStats });
  const { data: revenueData, isLoading: revenueLoading } = useQuery({ queryKey: ["monthly-revenue"], queryFn: dashboardApi.getMonthlyRevenue });
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });

  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);
  const upcomingClients = (clients ?? [])
    .filter(c => c.status === "active")
    .map(c => ({ ...c, nextDate: getNextCleaningDate(c) }))
    .filter(c => c.nextDate && isWithinInterval(c.nextDate, { start: startOfDay(now), end: weekEnd }))
    .sort((a, b) => (a.nextDate!.getTime() - b.nextDate!.getTime()));

  const recentClients = [...(clients ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const handleRecordCleaning = async (client: Client) => {
    try {
      await recordCleaning(client.id, new Date(), "");
      toast.success(`Cleaning recorded for ${client.name}`);
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["monthly-revenue"] });
    } catch {
      toast.error("Failed to record cleaning");
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-elevated"
      >
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        <div className="relative p-6 sm:p-8 text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Welcome back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">SparkleClean Dashboard</h1>
          <p className="text-sm opacity-80 mt-1 max-w-md">Your premium cleaning business at a glance. Track clients, revenue, and upcoming cleanings.</p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, gradient, isMoney }, i) => (
          <motion.div key={String(key) custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className={`${gradient} text-primary-foreground border-0 shadow-elevated overflow-hidden relative group hover:shadow-modal hover:scale-[1.02] transition-all duration-300`}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">{label}</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-24 mt-1 bg-primary-foreground/20" />
                    ) : (
                      <p className="text-3xl font-display font-bold mt-1">
                        {isMoney ? `$${(stats?.[key] ?? 0).toLocaleString()}` : stats?.[key] ?? 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Monthly Revenue</CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Last 6 months
            </div>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                      boxShadow: "var(--shadow-elevated)",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Cleanings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
          <Card className="shadow-card border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-display">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingClients.length === 0 ? (
                <div className="relative rounded-xl overflow-hidden py-12">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10"
                    loading="lazy"
                  />
                  <div className="relative text-center">
                    <CalendarDays className="w-10 h-10 mx-auto text-primary/40 mb-3" />
                    <p className="text-muted-foreground font-medium">All caught up!</p>
                    <p className="text-muted-foreground/70 text-sm mt-1">No cleanings scheduled this week 🎉</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingClients.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{format(c.nextDate!, "EEE, MMM d")} · ${c.pricePerVisit}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleRecordCleaning(c)} className="text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Clients */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}>
          <Card className="shadow-card border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-display">Recent Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {recentClients.length === 0 ? (
                <div className="relative rounded-xl overflow-hidden py-12">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10"
                    loading="lazy"
                  />
                  <div className="relative text-center">
                    <Users className="w-10 h-10 mx-auto text-primary/40 mb-3" />
                    <p className="text-muted-foreground font-medium">No clients yet</p>
                    <p className="text-muted-foreground/70 text-sm mt-1">Add your first client to get started</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentClients.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.address}</p>
                      </div>
                      <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
