"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Clock,
  FileText,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime, cn } from "@/lib/utils";
import { GalleryUploadCard } from "@/components/gallery/gallery-upload-card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    plumbing: <FileText className="h-4 w-4" />,
    electrical: <FileText className="h-4 w-4" />,
    internet: <FileText className="h-4 w-4" />,
    cleanliness: <FileText className="h-4 w-4" />,
    ac_heating: <FileText className="h-4 w-4" />,
  };
  return icons[category] || <FileText className="h-4 w-4" />;
};

export function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [likedIssues, setLikedIssues] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    pending: 0,
    resolved: 0,
    avgResolutionTime: "—",
  });
  const [myStats, setMyStats] = useState({
    reported: 0,
    resolved: 0,
    upvotesReceived: 0,
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [issuesRes, likedRes, myIssuesRes] = await Promise.all([
          fetch("/api/issues?onlyMine=true&limit=6&sortBy=createdAt&sortOrder=desc"),
          fetch("/api/issues?upvoted=true&limit=6&sortBy=createdAt&sortOrder=desc"),
          fetch("/api/issues?onlyMine=true&limit=50&sortBy=createdAt&sortOrder=desc"),
        ]);

        const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [] };
        const likedJson = likedRes.ok ? await likedRes.json() : { issues: [] };
        const myIssuesJson = myIssuesRes.ok ? await myIssuesRes.json() : { issues: [], pagination: {} };

        if (!isMounted) return;

        const fetchedIssues = issuesJson.issues || [];
        const myIssues = myIssuesJson.issues || [];
        const pending = fetchedIssues.filter((i: any) =>
          ["reported", "assigned", "in_progress"].includes(i.status)
        ).length;
        const resolved = fetchedIssues.filter((i: any) => i.status === "resolved").length;

        const resolvedWithTimes = fetchedIssues.filter(
          (i: any) => i.status === "resolved" && (i.resolvedAt || i.createdAt)
        );
        const avgResolutionHours = resolvedWithTimes.length
          ? resolvedWithTimes.reduce((sum: number, issue: any) => {
              const created = new Date(issue.createdAt).getTime();
              const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : created;
              const hours = Math.max((resolvedAt - created) / (1000 * 60 * 60), 0);
              return sum + hours;
            }, 0) / resolvedWithTimes.length
          : null;

        const upvotesReceived = myIssues.reduce((sum: number, item: any) => {
          const count = item.upvoteCount ?? item.upvotes ?? 0;
          return sum + count;
        }, 0);

        setIssues(fetchedIssues);
        setLikedIssues(likedJson.issues || []);
        setStatsData({
          pending,
          resolved,
          avgResolutionTime: avgResolutionHours ? `${avgResolutionHours.toFixed(1)} hours` : "—",
        });
        setMyStats({
          reported: myIssues.length,
          resolved: myIssues.filter((i: any) => i.status === "resolved").length,
          upvotesReceived,
        });
      } catch (error) {
        if (isMounted) {
          setIssues([]);
          setLikedIssues([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      title: "My Reports",
      value: myStats.reported,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/20",
      trend: `${myStats.resolved} resolved`,
      trendUp: myStats.resolved > 0,
    },
    {
      title: "Open Issues",
      value: statsData.pending,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-gradient-to-br from-amber-500/20 to-yellow-600/10",
      borderColor: "border-amber-500/20",
      trend: `${statsData.pending} active`,
      trendUp: false,
    },
    {
      title: "Upvotes Earned",
      value: myStats.upvotesReceived,
      icon: ThumbsUp,
      color: "text-emerald-500",
      bgColor: "bg-gradient-to-br from-emerald-500/20 to-green-600/10",
      borderColor: "border-emerald-500/20",
      trend: "Community support",
      trendUp: myStats.upvotesReceived > 0,
    },
    {
      title: "Avg Resolution",
      value: statsData.avgResolutionTime,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-500/20 to-pink-600/10",
      borderColor: "border-purple-500/20",
      trend: statsData.avgResolutionTime === "—" ? "No data yet" : "Based on my issues",
      trendUp: statsData.avgResolutionTime !== "—",
    },
  ];

  return (
    <div className="space-y-8 page-enter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 gradient-morph"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-white/70 mt-2">
            Track your reports and community activity in one place.
          </p>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <Card className={cn("glass-card-premium", stat.borderColor, "border")}> 
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-3 rounded-2xl", stat.bgColor, "border")}> 
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{stat.trend}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6">
        <GalleryUploadCard />
        <Card className="glass-card-premium overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                My Activity
              </CardTitle>
              <CardDescription>Issues you posted and issues you upvoted</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="group">
              <Link href="/dashboard/community">
                View My Issues
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">My Reports</TabsTrigger>
                <TabsTrigger value="liked">Upvoted</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="divide-y rounded-xl border">
                  {issues.map((issue, index) => (
                    <motion.div
                      key={issue._id || issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/issues/${issue._id || issue.id}`}
                        className="flex items-start gap-4 p-5 hover:bg-muted/50 transition-all duration-200 group"
                      >
                        <div className="p-3 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                          {getCategoryIcon(issue.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {issue.title}
                            </h4>
                            <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved"}>
                              {issue.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                              <Clock className="h-3.5 w-3.5" />
                              {formatRelativeTime(issue.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {issue.upvoteCount ?? issue.upvotes ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {typeof issue.comments === "number" ? issue.comments : issue.comments?.length ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  {!isLoading && issues.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No issues yet. Create your first report to see updates here.
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="liked" className="mt-6">
                <div className="divide-y rounded-xl border">
                  {likedIssues.map((issue, index) => (
                    <motion.div
                      key={issue._id || issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/issues/${issue._id || issue.id}`}
                        className="flex items-start gap-4 p-5 hover:bg-muted/50 transition-all duration-200 group"
                      >
                        <div className="p-3 rounded-xl bg-slate-500/15 text-slate-600 dark:text-slate-300">
                          {getCategoryIcon(issue.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {issue.title}
                            </h4>
                            <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved"}>
                              {issue.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {issue.upvoteCount ?? issue.upvotes ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {typeof issue.comments === "number" ? issue.comments : issue.comments?.length ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  {!isLoading && likedIssues.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No upvoted issues yet.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
