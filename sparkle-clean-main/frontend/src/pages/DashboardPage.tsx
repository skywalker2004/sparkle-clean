import { useQuery } from "@tanstack/react-query";
import { dashboardApi, getNextCleaningDate } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Users, DollarSign, AlertCircle, CalendarDays, CheckCircle2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function DashboardPage() {
  const qc = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });
  const { data: revenueData } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: dashboardApi.getMonthlyRevenue,
  });

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7502/ingest/6374a321-2831-470e-87f4-74d51ee0d4d1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "94c943" },
      body: JSON.stringify({
        sessionId: "94c943",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "DashboardPage.tsx:26",
        message: "DashboardPage mounted",
        data: { hasQueryClient: Boolean(qc) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [qc]);
  // #endregion

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7502/ingest/6374a321-2831-470e-87f4-74d51ee0d4d1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "94c943" },
      body: JSON.stringify({
        sessionId: "94c943",
        runId: "pre-fix",
        hypothesisId: "H5",
        location: "DashboardPage.tsx:44",
        message: "Dashboard query state updated",
        data: {
          statsLoading,
          hasStats: Boolean(stats),
          hasRevenueData: Array.isArray(revenueData),
          revenueCount: Array.isArray(revenueData) ? revenueData.length : -1,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [statsLoading, stats, revenueData]);
  // #endregion

  // Placeholder for upcoming clients - replace with real logic later
  const upcoming = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card-1 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm opacity-75">Active Clients</p>
                <p className="text-4xl font-bold mt-1">{stats?.totalActiveClients || 0}</p>
              </div>
              <Users className="w-10 h-10 opacity-75" />
            </div>
          </CardContent>
        </Card>
        {/* Add the other 3 cards similarly - I can expand if needed */}
      </div>

      {/* Chart and other sections */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}