"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, STATUS_LABELS } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface IssueItem {
  _id: string;
  status: string;
  hostel: string;
  createdAt: string;
  resolvedAt?: string;
}

interface AnnouncementItem {
  _id: string;
  createdAt: string;
  createdBy?: { role?: string };
  type?: string;
}

export default function ManagementAnalyticsPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [issuesRes, announcementsRes] = await Promise.all([
        fetch("/api/issues?limit=500&sortBy=createdAt&sortOrder=desc"),
        fetch("/api/announcements?limit=500"),
      ]);
      const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [] };
      const annJson = announcementsRes.ok ? await announcementsRes.json() : { announcements: [] };
      setIssues(issuesJson.issues || []);
      setAnnouncements(annJson.announcements || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    issues.forEach((issue) => {
      map[issue.status] = (map[issue.status] || 0) + 1;
    });
    return STATUS_LABELS.map((status) => ({
      name: status.name,
      value: map[status.id] || 0,
    }));
  }, [issues]);

  const issueTrend = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - idx));
      return {
        key: date.toDateString(),
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        reported: 0,
        resolved: 0,
      };
    });

    const map = new Map(days.map((d) => [d.key, d]));
    issues.forEach((issue) => {
      const created = new Date(issue.createdAt).toDateString();
      const bucket = map.get(created);
      if (bucket) bucket.reported += 1;
      if (issue.resolvedAt) {
        const resolvedKey = new Date(issue.resolvedAt).toDateString();
        const resolvedBucket = map.get(resolvedKey);
        if (resolvedBucket) resolvedBucket.resolved += 1;
      }
    });

    return days;
  }, [issues]);

  const hostelResolution = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    issues.forEach((issue) => {
      if (!issue.resolvedAt) return;
      const hostel = issue.hostel || "Unknown";
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.resolvedAt).getTime();
      const hours = Math.max((resolved - created) / (1000 * 60 * 60), 0);
      if (!map[hostel]) map[hostel] = { total: 0, count: 0 };
      map[hostel].total += hours;
      map[hostel].count += 1;
    });

    return Object.entries(map).map(([hostel, data]) => ({
      hostel,
      avgHours: data.count ? Number((data.total / data.count).toFixed(1)) : 0,
    }));
  }, [issues]);

  const announcementTrend = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - idx));
      return {
        key: date.toDateString(),
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        management: 0,
        student: 0,
        staff: 0,
      };
    });

    const map = new Map(days.map((d) => [d.key, d]));
    announcements.forEach((announcement) => {
      const key = new Date(announcement.createdAt).toDateString();
      const bucket = map.get(key);
      if (!bucket) return;
      const role = announcement.createdBy?.role;
      if (role === "management") bucket.management += 1;
      else if (role === "maintenance") bucket.staff += 1;
      else bucket.student += 1;
    });

    return days;
  }, [announcements]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Real-time operational insights for hostel management.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading analytics...</p>}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={issueTrend}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="reported" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} fill="#6366f1" label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hostel Resolution Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hostelResolution}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="hostel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgHours" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Announcement Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={announcementTrend}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="management" stroke="#ec4899" strokeWidth={2} />
                    <Line type="monotone" dataKey="student" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="staff" stroke="#38bdf8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">Management</Badge>
                  <Badge variant="secondary">Student</Badge>
                  <Badge variant="secondary">Staff</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
