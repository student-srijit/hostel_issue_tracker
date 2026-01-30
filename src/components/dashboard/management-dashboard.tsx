"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Building2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  MessageSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, ISSUE_CATEGORIES, STATUS_LABELS, HOSTELS, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function StatCard({ title, value, change, icon, color, description }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: color }}
        />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
              {change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : isNegative ? (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isPositive && "text-green-500",
                      isNegative && "text-red-500"
                    )}
                  >
                    {Math.abs(change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color}20` }}
            >
              <span style={{ color }}>{icon}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ManagementDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolved: 0,
    pending: 0,
    avgResolutionHours: 0,
  });
  const [issuesTrend, setIssuesTrend] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [hostelData, setHostelData] = useState<any[]>([]);
  const [resolutionTimeData, setResolutionTimeData] = useState<any[]>([]);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [redAlerts, setRedAlerts] = useState<any[]>([]);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    const limit = timeRange === "24h" ? 100 : timeRange === "90d" ? 300 : 200;
    const issuesRes = await fetch(`/api/issues?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
    const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [], pagination: {} };
    const issues = issuesJson.issues || [];

    const totalIssues = issuesJson.pagination?.total ?? issues.length;
    const resolvedCount = issues.filter((i: any) => i.status === "resolved").length;
    const pendingCount = issues.filter((i: any) => ["reported", "assigned", "in_progress"].includes(i.status)).length;
    const redAlertIssues = issues.filter((i: any) => i.urgencyLevel === "red" || i.priority === "emergency");

    const resolvedWithTimes = issues.filter(
      (i: any) => i.status === "resolved" && (i.resolvedAt || i.createdAt)
    );
    const avgResolutionHours = resolvedWithTimes.length
      ? resolvedWithTimes.reduce((sum: number, issue: any) => {
          const created = new Date(issue.createdAt).getTime();
          const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : created;
          const hours = Math.max((resolvedAt - created) / (1000 * 60 * 60), 0);
          return sum + hours;
        }, 0) / resolvedWithTimes.length
      : 0;

    // Trend: last 7 days
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      return {
        key: d.toDateString(),
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        reported: 0,
        resolved: 0,
      };
    });

    issues.forEach((issue: any) => {
      const createdKey = new Date(issue.createdAt).toDateString();
      const day = days.find((d) => d.key === createdKey);
      if (day) day.reported += 1;

      if (issue.status === "resolved" && issue.resolvedAt) {
        const resolvedKey = new Date(issue.resolvedAt).toDateString();
        const rday = days.find((d) => d.key === resolvedKey);
        if (rday) rday.resolved += 1;
      }
    });

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    issues.forEach((issue: any) => {
      categoryMap[issue.category] = (categoryMap[issue.category] || 0) + 1;
    });
    const categoryPalette = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#6b7280"];
    const categoryList = Object.entries(categoryMap).map(([name, value], idx) => ({
      name,
      value,
      color: categoryPalette[idx % categoryPalette.length],
    }));

    // Hostel breakdown
    const hostelMap: Record<string, { issues: number; resolved: number }> = {};
    issues.forEach((issue: any) => {
      const hostel = issue.hostel || "Unknown";
      if (!hostelMap[hostel]) hostelMap[hostel] = { issues: 0, resolved: 0 };
      hostelMap[hostel].issues += 1;
      if (issue.status === "resolved") hostelMap[hostel].resolved += 1;
    });
    const hostelList = Object.entries(hostelMap).map(([hostel, data]) => ({
      hostel,
      issues: data.issues,
      resolved: data.resolved,
    }));

    // Resolution time trend (last 4 weeks)
    const weeks = Array.from({ length: 4 }).map((_, idx) => ({
      name: `Week ${idx + 1}`,
      time: 0,
      count: 0,
    }));
    resolvedWithTimes.forEach((issue: any) => {
      const created = new Date(issue.createdAt).getTime();
      const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : created;
      const diffDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(Math.floor(diffDays / 7), 3);
      const hours = Math.max((resolvedAt - created) / (1000 * 60 * 60), 0);
      weeks[weekIndex].time += hours;
      weeks[weekIndex].count += 1;
    });
    const resolutionTrend = weeks.map((w) => ({
      name: w.name,
      time: w.count ? Math.round(w.time / w.count) : 0,
    }));

    // Recent issues
    const recent = issues.slice(0, 5).map((issue: any) => ({
      id: issue._id,
      title: issue.title,
      category: issue.category,
      priority: issue.priority,
      urgencyLevel: issue.urgencyLevel,
      status: issue.status,
      hostel: issue.hostel,
      reporter: issue.reporter?.name || "Unknown",
      time: issue.createdAt,
    }));

    // Top performers
    const perfRes = await fetch("/api/staff/performance?period=month");
    const perfJson = perfRes.ok ? await perfRes.json() : { leaderboard: [] };
    const performers = (perfJson.leaderboard || []).slice(0, 5).map((p: any) => ({
      name: p.name,
      resolved: p.tasksCompleted ?? 0,
      rating: p.avgRating ?? 0,
    }));

    setStats({
      totalIssues,
      resolved: resolvedCount,
      pending: pendingCount,
      avgResolutionHours,
    });
    setIssuesTrend(days.map(({ key, ...rest }) => rest));
    setCategoryData(categoryList);
    setHostelData(hostelList);
    setResolutionTimeData(resolutionTrend);
    setRecentIssues(recent);
    setTopPerformers(performers);
    setRedAlerts(redAlertIssues.slice(0, 5));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  };

  const handleStatusUpdate = async (issueId: string, status: "reported" | "in_progress" | "resolved" | "rejected") => {
    try {
      setStatusUpdatingId(issueId);
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(`Issue marked as ${status.replace("_", " ")}`);
      await loadDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update issue");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [timeRange]);

  const resolutionChange = (() => {
    if (resolutionTimeData.length < 2) return null;
    const last = resolutionTimeData[resolutionTimeData.length - 1]?.time || 0;
    const prev = resolutionTimeData[resolutionTimeData.length - 2]?.time || 0;
    if (!prev) return null;
    const diff = Math.round(((prev - last) / prev) * 100);
    return diff;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of hostel issues and maintenance performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Issues"
          value={stats.totalIssues}
          icon={<AlertCircle className="h-6 w-6" />}
          color="#3b82f6"
        />
        <StatCard
          title="Open Issues"
          value={stats.pending}
          icon={<Clock className="h-6 w-6" />}
          color="#f59e0b"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="#10b981"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={stats.avgResolutionHours ? `${stats.avgResolutionHours.toFixed(1)}h` : "—"}
          icon={<Activity className="h-6 w-6" />}
          color="#8b5cf6"
        />
        <StatCard
          title="Red Alerts"
          value={redAlerts.length}
          icon={<Zap className="h-6 w-6" />}
          color="#ef4444"
          description="Critical safety issues"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Issues Trend</CardTitle>
                <CardDescription>Reported vs Resolved issues over time</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={issuesTrend}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="reported"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorReported)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Issues by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hostel Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hostel-wise Issues</CardTitle>
            <CardDescription>Issues and resolution by hostel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hostelData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hostel" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="issues" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time</CardTitle>
            <CardDescription>Average time to resolve (hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {resolutionChange !== null
                    ? `${Math.abs(resolutionChange)}% improvement in resolution time`
                    : "Resolution time trend loading"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Red Alerts */}
        <Card className="lg:col-span-1 border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Zap className="h-5 w-5" />
              Red Alerts
            </CardTitle>
            <CardDescription>Immediate attention required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {redAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No red alerts right now.</p>
            )}
            {redAlerts.map((issue: any) => (
              <div
                key={issue._id}
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3"
              >
                <p className="text-sm font-semibold text-red-500">{issue.title}</p>
                <p className="text-xs text-muted-foreground">
                  {issue.hostel} • {formatRelativeTime(issue.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Latest reported issues</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {recentIssues.map((issue) => {
                  const category = ISSUE_CATEGORIES.find((c) => c.id === issue.category);
                  const status = STATUS_LABELS.find((s) => s.id === issue.status);
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          <Building2
                            className="h-5 w-5"
                            style={{ color: category?.color }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {issue.hostel} • {issue.reporter}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={issue.priority as "low" | "medium" | "high" | "emergency"}
                        >
                          {issue.priority}
                        </Badge>
                        <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved" | "rejected"}>
                          {status?.name || issue.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(issue.time)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusUpdatingId === issue.id}
                          onClick={() => handleStatusUpdate(issue.id, "resolved")}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={statusUpdatingId === issue.id}
                          onClick={() => handleStatusUpdate(issue.id, "reported")}
                        >
                          Reopen
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Best performing maintenance teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topPerformers.map((performer, index) => (
                <div key={performer.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center font-bold text-white",
                          index === 0 && "bg-yellow-500",
                          index === 1 && "bg-gray-400",
                          index === 2 && "bg-amber-700"
                        )}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{performer.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{performer.resolved}</p>
                      <p className="text-xs text-muted-foreground">resolved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(performer.rating / 5) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{performer.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
