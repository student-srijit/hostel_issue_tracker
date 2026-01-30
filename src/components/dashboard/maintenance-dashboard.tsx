"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  Play,
  Pause,
  MoreHorizontal,
  Star,
  Target,
  Flame,
  TrendingUp,
  Building2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, ISSUE_CATEGORIES, STATUS_LABELS, PRIORITY_LEVELS } from "@/lib/utils";

interface IssueTask {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  hostel: string;
  block: string;
  floor: string;
  room: string;
  reporter?: { name?: string };
  assignedAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface PerformanceStats {
  tasksCompleted: number;
  tasksAssigned: number;
  avgRating: number;
  avgResolutionTime: number | null;
  rank?: number;
  totalStaff?: number;
}

export function MaintenanceDashboard() {
  const { data: session } = useSession();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<IssueTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<IssueTask[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    tasksCompleted: 0,
    tasksAssigned: 0,
    avgRating: 0,
    avgResolutionTime: null,
  });

  useEffect(() => {
    let active = true;

    const loadTasks = async () => {
      try {
        const [assignedRes, completedRes] = await Promise.all([
          fetch("/api/issues?assignedTo=me&status=assigned,in_progress&limit=30"),
          fetch("/api/issues?assignedTo=me&status=resolved&limit=30"),
        ]);

        const assignedJson = assignedRes.ok ? await assignedRes.json() : { issues: [] };
        const completedJson = completedRes.ok ? await completedRes.json() : { issues: [] };

        if (active) {
          setAssignedTasks(assignedJson.issues || []);
          setCompletedTasks(completedJson.issues || []);
        }
      } catch {
        if (active) {
          setAssignedTasks([]);
          setCompletedTasks([]);
        }
      }
    };

    const loadPerformance = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/staff/performance?staffId=${session.user.id}&period=month`);
        if (!response.ok) throw new Error("Failed to load performance");
        const data = await response.json();
        const leaderboard = data.leaderboard || [];
        const staffRank = leaderboard.findIndex((entry: any) => entry._id?.toString?.() === session.user.id || entry.staffId?.toString?.() === session.user.id);
        const myEntry = leaderboard.find((entry: any) => entry._id?.toString?.() === session.user.id);

        if (active) {
          setPerformanceStats({
            tasksCompleted: myEntry?.tasksCompleted || 0,
            tasksAssigned: myEntry?.tasksAssigned || 0,
            avgRating: myEntry?.avgRating || 0,
            avgResolutionTime: myEntry?.avgResolutionTime || null,
            rank: staffRank >= 0 ? staffRank + 1 : undefined,
            totalStaff: leaderboard.length || undefined,
          });
        }
      } catch {
        if (active) {
          setPerformanceStats((prev) => ({
            ...prev,
            avgRating: 0,
            avgResolutionTime: null,
          }));
        }
      }
    };

    loadTasks();
    loadPerformance();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const handleStartTask = (taskId: string) => {
    setActiveTask(taskId);
    // In real app, update task status via API
  };

  const handleCompleteTask = (taskId: string) => {
    // In real app, mark task as complete via API
    setActiveTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
        <p className="text-muted-foreground">Your assigned tasks and performance overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignedTasks.length}</p>
                <p className="text-xs text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{performanceStats.tasksCompleted}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {performanceStats.avgRating ? performanceStats.avgRating.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {performanceStats.avgResolutionTime ? `${performanceStats.avgResolutionTime}h` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="assigned" className="w-full">
            <TabsList>
              <TabsTrigger value="assigned" className="gap-2">
                <Clock className="h-4 w-4" />
                Assigned ({assignedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="mt-4">
              <div className="space-y-4">
                {assignedTasks.map((task) => {
                  const category = ISSUE_CATEGORIES.find((c) => c.id === task.category);
                  const priority = PRIORITY_LEVELS.find((p) => p.id === task.priority);
                  const isActive = activeTask === task._id;

                  return (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={cn(
                          "transition-all",
                          isActive && "ring-2 ring-primary"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className="p-3 rounded-xl shrink-0"
                              style={{ backgroundColor: `${category?.color}20` }}
                            >
                              <Building2
                                className="h-6 w-6"
                                style={{ color: category?.color }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={task.priority as "low" | "medium" | "high" | "emergency"}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="secondary">{category?.name}</Badge>
                                {isActive && (
                                  <Badge variant="outline" className="gap-1 animate-pulse">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    In Progress
                                  </Badge>
                                )}
                              </div>

                              <h3 className="font-semibold mb-2">{task.title}</h3>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {task.hostel}, Block {task.block}, {task.room}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {task.reporter?.name || "Resident"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Assigned {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {!isActive ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartTask(task._id)}
                                  className="gap-2"
                                >
                                  <Play className="h-4 w-4" />
                                  Start
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleCompleteTask(task._id)}
                                  className="gap-2 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Complete
                                </Button>
                              )}
                              <Link href={`/issues/${task._id}`}>
                                <Button size="sm" variant="outline" className="w-full gap-2">
                                  View
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <div className="space-y-4">
                {completedTasks.map((task) => {
                  const category = ISSUE_CATEGORIES.find((c) => c.id === task.category);

                  return (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className="p-3 rounded-xl shrink-0"
                              style={{ backgroundColor: `${category?.color}20` }}
                            >
                              <CheckCircle2
                                className="h-6 w-6"
                                style={{ color: category?.color }}
                              />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Completed {formatDistanceToNow(new Date(task.resolvedAt || task.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceStats.rank && (
                <div className="rounded-xl border border-dashed p-3 text-center text-sm text-muted-foreground">
                  Rank #{performanceStats.rank}
                  {performanceStats.totalStaff ? ` of ${performanceStats.totalStaff}` : ""}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {performanceStats.avgResolutionTime ? `${performanceStats.avgResolutionTime}h` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg. Resolution</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {performanceStats.avgRating ? performanceStats.avgRating.toFixed(1) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg. Rating</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{performanceStats.tasksAssigned}</p>
                  <p className="text-xs text-muted-foreground">Tasks Assigned</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{performanceStats.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Supervisor
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                View Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertCircle className="h-4 w-4" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
