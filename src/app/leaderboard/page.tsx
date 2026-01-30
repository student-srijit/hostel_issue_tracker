"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Star,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Building2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StudentEntry {
  rank: number;
  name: string;
  hostel?: string;
  karma: number;
  issuesReported: number;
  trend: "up" | "down" | "same";
  avatar?: string;
}

interface StaffEntry {
  rank: number;
  name: string;
  specialization?: string;
  tasksCompleted: number;
  rating?: number;
  avgTime?: string;
  trend: "up" | "down" | "same";
}

interface HostelEntry {
  rank: number;
  name: string;
  avgResolutionTime: string;
  issuesResolved: number;
  rating?: number;
  trend: "up" | "down" | "same";
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
          <Crown className="h-4 w-4 text-white" />
        </div>
      );
    case 2:
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
          <Medal className="h-4 w-4 text-white" />
        </div>
      );
    case 3:
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
          <Medal className="h-4 w-4 text-white" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
          {rank}
        </div>
      );
  }
}

function StudentLeaderboardCard({ items, isLoading }: { items: StudentEntry[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Top Students
        </CardTitle>
        <CardDescription>Students with highest karma points this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading leaderboard...</div>
          )}
          {!isLoading && items.length === 0 && (
            <div className="text-sm text-muted-foreground">No data yet.</div>
          )}
          {items.slice(0, 5).map((student, index) => (
            <motion.div
              key={student.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50",
                student.rank <= 3 && "bg-gradient-to-r from-primary/5 to-transparent"
              )}
            >
              {getRankBadge(student.rank)}
              <Avatar className="h-10 w-10">
                <AvatarImage src={student.avatar} />
                <AvatarFallback>
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.hostel}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-primary">{student.karma}</span>
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground">{student.issuesReported} reports</p>
              </div>
              {getTrendIcon(student.trend)}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MaintenanceLeaderboardCard({ items, isLoading }: { items: StaffEntry[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Maintenance Staff
        </CardTitle>
        <CardDescription>Staff with best performance this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading staff rankings...</div>
          )}
          {!isLoading && items.length === 0 && (
            <div className="text-sm text-muted-foreground">No data yet.</div>
          )}
          {items.map((staff, index) => (
            <motion.div
              key={staff.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50",
                staff.rank <= 3 && "bg-gradient-to-r from-primary/5 to-transparent"
              )}
            >
              {getRankBadge(staff.rank)}
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {staff.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{staff.name}</p>
                <p className="text-xs text-muted-foreground">{staff.specialization || "Maintenance"}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{staff.tasksCompleted}</span>
                  <span className="text-xs text-muted-foreground">tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs">{staff.rating ?? "—"}</span>
                </div>
              </div>
              {getTrendIcon(staff.trend)}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HostelLeaderboardCard({ items, isLoading }: { items: HostelEntry[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Hostel Rankings
        </CardTitle>
        <CardDescription>Hostels ranked by issue resolution efficiency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading hostel rankings...</div>
          )}
          {!isLoading && items.length === 0 && (
            <div className="text-sm text-muted-foreground">No data yet.</div>
          )}
          {items.map((hostel, index) => (
            <motion.div
              key={hostel.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50",
                hostel.rank <= 3 && "bg-gradient-to-r from-primary/5 to-transparent"
              )}
            >
              {getRankBadge(hostel.rank)}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{hostel.name}</p>
                <p className="text-xs text-muted-foreground">
                  Avg. resolution: {hostel.avgResolutionTime}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{hostel.issuesResolved}</span>
                  <span className="text-xs text-muted-foreground">resolved</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs">{hostel.rating ?? "—"}</span>
                </div>
              </div>
              {getTrendIcon(hostel.trend)}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Achievements removed (no mock data)

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [studentLeaderboard, setStudentLeaderboard] = useState<StudentEntry[]>([]);
  const [maintenanceLeaderboard, setMaintenanceLeaderboard] = useState<StaffEntry[]>([]);
  const [hostelLeaderboard, setHostelLeaderboard] = useState<HostelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadIssuesLeaderboard = async () => {
      try {
        const response = await fetch("/api/issues?scope=college&limit=300&sortBy=createdAt&sortOrder=desc");
        const data = response.ok ? await response.json() : { issues: [] };
        const issues = data.issues || [];

        const studentMap = new Map<string, { name: string; hostel?: string; karma: number; issuesReported: number }>();
        const hostelMap = new Map<string, { resolved: number; totalResolutionHours: number }>();

        issues.forEach((issue: any) => {
          const reporterId = issue.reporter?._id || issue.reporter?.id || issue.reporter;
          if (reporterId) {
            const entry = studentMap.get(reporterId) || {
              name: issue.reporter?.name || "Resident",
              hostel: issue.hostel,
              karma: 0,
              issuesReported: 0,
            };
            entry.issuesReported += 1;
            entry.karma += issue.upvoteCount ?? issue.upvotes ?? 0;
            studentMap.set(reporterId, entry);
          }

          const hostelKey = issue.hostel || "Unknown";
          const hostelEntry = hostelMap.get(hostelKey) || { resolved: 0, totalResolutionHours: 0 };
          if (issue.status === "resolved") {
            hostelEntry.resolved += 1;
            const createdAt = new Date(issue.createdAt).getTime();
            const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : createdAt;
            const hours = Math.max((resolvedAt - createdAt) / (1000 * 60 * 60), 0);
            hostelEntry.totalResolutionHours += hours;
          }
          hostelMap.set(hostelKey, hostelEntry);
        });

        const students = Array.from(studentMap.values())
          .sort((a, b) => b.karma - a.karma)
          .slice(0, 10)
          .map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            hostel: entry.hostel,
            karma: entry.karma,
            issuesReported: entry.issuesReported,
            trend: "same" as const,
          }));

        const hostels = Array.from(hostelMap.entries())
          .map(([name, entry]) => {
            const avgResolution = entry.resolved
              ? entry.totalResolutionHours / entry.resolved
              : 0;
            return {
              name,
              issuesResolved: entry.resolved,
              avgResolutionTime: avgResolution ? `${avgResolution.toFixed(1)}h` : "—",
            };
          })
          .sort((a, b) => b.issuesResolved - a.issuesResolved)
          .slice(0, 8)
          .map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            issuesResolved: entry.issuesResolved,
            avgResolutionTime: entry.avgResolutionTime,
            trend: "same" as const,
          }));

        if (active) {
          setStudentLeaderboard(students);
          setHostelLeaderboard(hostels);
        }
      } catch {
        if (active) {
          setStudentLeaderboard([]);
          setHostelLeaderboard([]);
        }
      }
    };

    const loadMaintenanceLeaderboard = async () => {
      try {
        const response = await fetch("/api/staff/performance?period=month");
        const data = response.ok ? await response.json() : { leaderboard: [] };
        const staff = (data.leaderboard || []).map((entry: any) => ({
          rank: entry.rank,
          name: entry.name,
          specialization: entry.specialization,
          tasksCompleted: entry.tasksCompleted,
          rating: entry.avgRating,
          avgTime: entry.avgResolutionTime ? `${entry.avgResolutionTime}h` : undefined,
          trend: "same" as const,
        }));
        if (active) setMaintenanceLeaderboard(staff);
      } catch {
        if (active) setMaintenanceLeaderboard([]);
      }
    };

    Promise.all([loadIssuesLeaderboard(), loadMaintenanceLeaderboard()])
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top performers and achievements in hostel management
          </p>
        </div>

        {/* Leaderboards */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Trophy className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="hostels" className="gap-2">
              <Building2 className="h-4 w-4" />
              Hostels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentLeaderboardCard items={studentLeaderboard} isLoading={isLoading} />
              <Card>
                <CardHeader>
                  <CardTitle>Full Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {isLoading && (
                      <div className="text-sm text-muted-foreground">Loading leaderboard...</div>
                    )}
                    {!isLoading && studentLeaderboard.length === 0 && (
                      <div className="text-sm text-muted-foreground">No data yet.</div>
                    )}
                    {studentLeaderboard.slice(5).map((student) => (
                      <div
                        key={student.rank}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <span className="w-6 text-center text-sm text-muted-foreground">
                          {student.rank}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm truncate">{student.name}</span>
                        <span className="font-medium">{student.karma}</span>
                        {getTrendIcon(student.trend)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceLeaderboardCard items={maintenanceLeaderboard} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="hostels" className="mt-6">
            <HostelLeaderboardCard items={hostelLeaderboard} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
