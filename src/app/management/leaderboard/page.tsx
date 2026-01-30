"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnnouncementItem {
  _id: string;
  createdBy?: { _id?: string; name?: string; avatar?: string; role?: string };
  createdAt: string;
}

interface IssueItem {
  _id: string;
  reporter?: { _id?: string; name?: string; avatar?: string };
  createdAt: string;
}

interface StaffEntry {
  rank: number;
  name: string;
  tasksCompleted: number;
  avgRating?: number;
  staffId?: string;
}

export default function ManagementLeaderboardPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [staffLeaderboard, setStaffLeaderboard] = useState<StaffEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [annRes, issuesRes, staffRes] = await Promise.all([
        fetch("/api/announcements?limit=500"),
        fetch("/api/issues?limit=500&sortBy=createdAt&sortOrder=desc"),
        fetch("/api/staff/performance?period=month"),
      ]);
      const annJson = annRes.ok ? await annRes.json() : { announcements: [] };
      const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [] };
      const staffJson = staffRes.ok ? await staffRes.json() : { leaderboard: [] };
      setAnnouncements(annJson.announcements || []);
      setIssues(issuesJson.issues || []);
      setStaffLeaderboard(staffJson.leaderboard || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentAnnouncementRanks = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string; count: number }>();
    announcements.forEach((announcement) => {
      if (announcement.createdBy?.role !== "student") return;
      const id = announcement.createdBy?._id || "unknown";
      const current = map.get(id) || {
        id,
        name: announcement.createdBy?.name || "Student",
        avatar: announcement.createdBy?.avatar,
        count: 0,
      };
      current.count += 1;
      map.set(id, current);
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [announcements]);

  const studentIssueRanks = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string; count: number }>();
    issues.forEach((issue) => {
      if (!issue.reporter?._id) return;
      const id = issue.reporter._id;
      const current = map.get(id) || {
        id,
        name: issue.reporter?.name || "Student",
        avatar: issue.reporter?.avatar,
        count: 0,
      };
      current.count += 1;
      map.set(id, current);
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [issues]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-7 w-7 text-primary" />
              Management Leaderboards
            </h1>
            <p className="text-muted-foreground">Rankings based on real announcements, issues, and staff performance.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading leaderboards...</p>}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Student Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentAnnouncementRanks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No student announcements yet.</p>
                )}
                {studentAnnouncementRanks.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <UserAvatar name={entry.name} image={entry.avatar} size="sm" />
                    <span className="flex-1 text-sm truncate">{entry.name}</span>
                    <Badge>{entry.count} posts</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Issue Reporters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentIssueRanks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No issue data yet.</p>
                )}
                {studentIssueRanks.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <UserAvatar name={entry.name} image={entry.avatar} size="sm" />
                    <span className="flex-1 text-sm truncate">{entry.name}</span>
                    <Badge>{entry.count} issues</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Maintenance Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffLeaderboard.length === 0 && (
                  <p className="text-sm text-muted-foreground">No staff performance data yet.</p>
                )}
                {staffLeaderboard.slice(0, 10).map((entry) => (
                  <div key={entry.rank} className="flex items-center gap-3">
                    <Badge variant="secondary">#{entry.rank}</Badge>
                    <span className="flex-1 text-sm truncate">{entry.name}</span>
                    <Badge>{entry.tasksCompleted} tasks</Badge>
                    <Badge variant="secondary">{entry.avgRating?.toFixed?.(1) || "—"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
