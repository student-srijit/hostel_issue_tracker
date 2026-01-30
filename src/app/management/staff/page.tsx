"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  employeeId?: string;
  department?: string;
  specialization?: string[];
  hostel?: string;
  phone?: string;
  lastLogin?: string;
  assignedCount: number;
  resolvedCount: number;
}

interface StaffPerformanceEntry {
  _id: string;
  avgRating?: number;
  tasksCompleted?: number;
}

export default function ManagementStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [performance, setPerformance] = useState<StaffPerformanceEntry[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [staffRes, perfRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/staff/performance?period=month"),
      ]);
      const staffJson = staffRes.ok ? await staffRes.json() : { staff: [] };
      const perfJson = perfRes.ok ? await perfRes.json() : { leaderboard: [] };
      setStaff(staffJson.staff || []);
      setPerformance(perfJson.leaderboard || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const performanceMap = useMemo(() => {
    return new Map(
      performance.map((entry) => [entry._id?.toString?.() || entry._id, entry])
    );
  }, [performance]);

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff;
    const q = search.toLowerCase();
    return staff.filter((member) =>
      [member.name, member.email, member.employeeId, member.department]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(q))
    );
  }, [staff, search]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Staff Directory</h1>
            <p className="text-muted-foreground">All maintenance staff accounts with live performance data.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Staff Members</CardTitle>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, employee ID..."
              className="md:w-72"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading staff...</p>}
            {!isLoading && filteredStaff.length === 0 && (
              <p className="text-sm text-muted-foreground">No staff found.</p>
            )}
            {filteredStaff.map((member) => {
              const perf = performanceMap.get(member._id?.toString?.() || member._id);
              return (
                <div
                  key={member._id}
                  className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar name={member.name} image={member.avatar} size="md" />
                    <div>
                      <p className="text-base font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {member.employeeId && <Badge variant="outline">ID: {member.employeeId}</Badge>}
                        {member.department && <Badge variant="outline">{member.department}</Badge>}
                        {member.hostel && <Badge variant="outline">{member.hostel}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="secondary">Assigned: {member.assignedCount}</Badge>
                    <Badge variant="secondary">Resolved: {member.resolvedCount}</Badge>
                    <Badge variant="secondary">Rating: {perf?.avgRating ? perf.avgRating.toFixed(1) : "—"}</Badge>
                    <Badge variant="secondary">Tasks: {perf?.tasksCompleted ?? 0}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
