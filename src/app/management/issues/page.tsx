"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, STATUS_LABELS } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

interface IssueItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  hostel: string;
  block: string;
  floor: string;
  room: string;
  createdAt: string;
  reporter?: { name?: string };
  assignedTo?: { _id: string; name?: string };
}

interface StaffMember {
  _id: string;
  name: string;
  employeeId?: string;
}

export default function ManagementIssuesPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [issuesRes, staffRes] = await Promise.all([
        fetch("/api/issues?limit=300&sortBy=createdAt&sortOrder=desc"),
        fetch("/api/staff"),
      ]);
      const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [] };
      const staffJson = staffRes.ok ? await staffRes.json() : { staff: [] };
      setIssues(issuesJson.issues || []);
      setStaff(staffJson.staff || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIssues = useMemo(() => {
    let result = issues;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(q) ||
          issue.hostel?.toLowerCase().includes(q) ||
          issue.reporter?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((issue) => issue.status === statusFilter);
    }
    return result;
  }, [issues, search, statusFilter]);

  const handleAssign = async (issueId: string, staffId: string) => {
    try {
      await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: staffId }),
      });
      await loadData();
    } catch {
      // ignore
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Issues</h1>
            <p className="text-muted-foreground">Assign staff and monitor all reported issues.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Issue Queue
            </CardTitle>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, hostel, reporter..."
                className="md:w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_LABELS.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <p className="text-sm text-muted-foreground">Loading issues...</p>}
            {!isLoading && filteredIssues.length === 0 && (
              <p className="text-sm text-muted-foreground">No issues found.</p>
            )}
            {filteredIssues.map((issue) => {
              const status = STATUS_LABELS.find((s) => s.id === issue.status);
              return (
                <div
                  key={issue._id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <Link href={`/issues/${issue._id}`} className="font-semibold hover:underline">
                      {issue.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {issue.hostel} • Block {issue.block} • Floor {issue.floor} • Room {issue.room}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {issue.reporter?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={issue.priority as "low" | "medium" | "high" | "emergency"}>
                      {issue.priority}
                    </Badge>
                    <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved" | "rejected"}>
                      {status?.name || issue.status}
                    </Badge>
                    <Select
                      value={issue.assignedTo?._id || ""}
                      onValueChange={(value) => handleAssign(issue._id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member._id} value={member._id}>
                            {member.name} {member.employeeId ? `(${member.employeeId})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
