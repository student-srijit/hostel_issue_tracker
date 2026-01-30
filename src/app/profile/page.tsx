"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Target,
  Edit2,
  Camera,
  Share2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ActivityEntry {
  id: string;
  title: string;
  action: "created" | "resolved";
  date: string;
  status: string;
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: any;
  label: string;
  value: number | string;
  subtext?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: ActivityEntry }) {
  const getActivityIcon = () => {
    return activity.action === "created" ? (
      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
      </div>
    ) : (
      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-4 w-4 text-green-600" />
      </div>
    );
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      {getActivityIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.title}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {activity.action} • {new Date(activity.date).toLocaleDateString()}
        </p>
      </div>
      {activity.status && (
        <Badge
          variant={
            activity.status === "resolved"
              ? "default"
              : activity.status === "pending"
              ? "secondary"
              : "outline"
          }
          className="text-xs"
        >
          {activity.status.replace(/_/g, " ")}
        </Badge>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);

  useEffect(() => {
    setStudentId(session?.user?.studentId || "");
  }, [session?.user?.studentId]);

  useEffect(() => {
    let active = true;

    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/issues?onlyMine=true&limit=200&sortBy=createdAt&sortOrder=desc");
        const data = response.ok ? await response.json() : { issues: [] };
        if (active) setMyIssues(data.issues || []);
      } catch {
        if (active) setMyIssues([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProfileData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (session?.user?.studentId) {
      setStudentId(session.user.studentId);
    }
  }, [session?.user?.studentId]);

  const stats = useMemo(() => {
    const totalIssues = myIssues.length;
    const resolvedIssues = myIssues.filter((i) => i.status === "resolved").length;
    const pendingIssues = myIssues.filter((i) => ["reported", "assigned", "in_progress"].includes(i.status)).length;
    const criticalIssues = myIssues.filter((i) => i.priority === "emergency").length;
    const upvotesReceived = myIssues.reduce((sum, i) => sum + (i.upvoteCount ?? i.upvotes ?? 0), 0);
    const commentsReceived = myIssues.reduce(
      (sum, i) => sum + (typeof i.comments === "number" ? i.comments : i.comments?.length ?? 0),
      0
    );
    const resolutionRate = totalIssues ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    return {
      totalIssues,
      resolvedIssues,
      pendingIssues,
      criticalIssues,
      upvotesReceived,
      commentsReceived,
      resolutionRate,
    };
  }, [myIssues]);

  const recentActivity: ActivityEntry[] = useMemo(() => {
    return myIssues.slice(0, 8).map((issue) => ({
      id: issue._id || issue.id,
      title: issue.title,
      action: issue.status === "resolved" ? "resolved" : "created",
      date: issue.createdAt,
      status: issue.status,
    }));
  }, [myIssues]);

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleVerifyStudentId = async () => {
    if (!studentId.trim()) {
      setVerifyError("Enter your college ID to verify.");
      setVerifyMessage(null);
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyMessage(null);

    try {
      const response = await fetch("/api/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Verification failed");
      }

      setVerifyMessage("College ID verified. Your hosteler badge is now active.");
      await update({ isVerified: true, studentId: studentId.trim() });
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleScanVerify = async () => {
    if (!scanFile) {
      setVerifyError("Upload a clear ID card image.");
      setVerifyMessage(null);
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", scanFile);

      const response = await fetch("/api/users/verify/scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setScanResult(data?.scanResult || null);
        throw new Error(data?.error || "Scan failed");
      }

      setScanResult(data?.scanResult || null);
      if (data?.scanResult?.student_id) {
        setStudentId(data.scanResult.student_id);
      }
      setVerifyMessage("College ID verified. Your hosteler badge is now active.");
      await update({ isVerified: true, studentId: data?.scanResult?.student_id || studentId.trim() });
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{userName}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {session?.user?.role || "student"}
                      </Badge>
                      {session?.user?.isVerified && (
                        <Badge variant="secondary" className="gap-1">
                          Verified Hosteler
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {session?.user?.college || "Your College"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{session?.user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{session?.user?.hostel || "Hostel not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  Block {session?.user?.block || "—"}, Room {session?.user?.room || "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hosteler Verification</CardTitle>
            <CardDescription>
              Verify your college ID to unlock a verified hosteler badge on all your posts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="idCard">Upload ID card image</Label>
                <Input
                  id="idCard"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setScanFile(file);
                  }}
                />
              </div>
              <Button onClick={handleScanVerify} disabled={verifyLoading}>
                {verifyLoading ? "Scanning..." : "Scan ID"}
              </Button>
            </div>

            {scanResult && (
              <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Detected document: {scanResult.doc_type || "unknown"}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Name:</span> {scanResult.name || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">College:</span> {scanResult.college || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Student ID:</span> {scanResult.student_id || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">DOB:</span> {scanResult.dob || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span> {scanResult.phone || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hostel:</span> {scanResult.hostel || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Block:</span> {scanResult.block || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Floor:</span> {scanResult.floor || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room:</span> {scanResult.room || "—"}
                  </div>
                </div>
                {scanResult.raw_text && (
                  <details className="rounded-lg border border-white/10 bg-black/10 p-3">
                    <summary className="cursor-pointer text-xs text-muted-foreground">View raw OCR text</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                      {scanResult.raw_text}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="studentId">College ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="Enter your college ID"
                />
              </div>
              <Button onClick={handleVerifyStudentId} disabled={verifyLoading}>
                {verifyLoading ? "Verifying..." : "Verify ID"}
              </Button>
            </div>
            {verifyMessage && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                {verifyMessage}
              </div>
            )}
            {verifyError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {verifyError}
              </div>
            )}
            {session?.user?.isVerified && (
              <Badge variant="secondary">Verified Hosteler Active</Badge>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            label="Total Issues"
            value={stats.totalIssues}
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Resolved"
            value={stats.resolvedIssues}
            subtext={`${stats.resolutionRate}% rate`}
            color="bg-green-100 dark:bg-green-900/30 text-green-600"
          />
          <StatCard
            icon={Star}
            label="Upvotes Received"
            value={stats.upvotesReceived}
            color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Pending Issues"
            value={stats.pendingIssues}
            color="bg-orange-100 dark:bg-orange-900/30 text-orange-600"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {isLoading && (
                    <div className="text-sm text-muted-foreground">Loading activity...</div>
                  )}
                  {!isLoading && recentActivity.length === 0 && (
                    <div className="text-sm text-muted-foreground">No activity yet.</div>
                  )}
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ActivityItem activity={activity} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Resolution</CardTitle>
                  <CardDescription>Your issue resolution statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Resolution Rate</span>
                      <span className="text-2xl font-bold">{stats.resolutionRate}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p className="font-bold text-green-600">{stats.resolvedIssues}</p>
                        <p className="text-muted-foreground">Resolved</p>
                      </div>
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <p className="font-bold text-yellow-600">{stats.pendingIssues}</p>
                        <p className="text-muted-foreground">Pending</p>
                      </div>
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="font-bold text-red-600">{stats.criticalIssues}</p>
                        <p className="text-muted-foreground">Critical</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>Your engagement statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{stats.totalIssues}</p>
                      <p className="text-sm text-muted-foreground">Issues Reported</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{stats.upvotesReceived}</p>
                      <p className="text-sm text-muted-foreground">Upvotes Received</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{stats.commentsReceived}</p>
                      <p className="text-sm text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{stats.pendingIssues}</p>
                      <p className="text-sm text-muted-foreground">Open Issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
