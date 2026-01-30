"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Crown,
  Flame,
  Plus,
  Images,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryUploadCard } from "@/components/gallery/gallery-upload-card";
import { cn, formatRelativeTime, STATUS_LABELS } from "@/lib/utils";

interface IssueItem {
  _id: string;
  title: string;
  category: string;
  status: string;
  upvoteCount?: number;
  upvotes?: number;
  createdAt: string;
  reporter?: {
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  type?: string;
  priority?: string;
  createdAt: string;
}

interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption?: string;
  uploadDate: string;
  academicYear?: string;
  uploadedBy?: {
    name?: string;
    avatar?: string;
  };
}

export function CollegeHome() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [galleryPosts, setGalleryPosts] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [issuesRes, annRes, galleryRes] = await Promise.all([
          fetch("/api/issues?limit=6&sortBy=upvotes&sortOrder=desc"),
          fetch("/api/announcements?limit=5"),
          fetch("/api/gallery?limit=4"),
        ]);

        const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [] };
        const annJson = annRes.ok ? await annRes.json() : { announcements: [] };
        const galleryJson = galleryRes.ok ? await galleryRes.json() : { posts: [] };

        if (!active) return;
        setIssues(issuesJson.issues || []);
        setAnnouncements(annJson.announcements || []);
        setGalleryPosts(galleryJson.posts || []);
      } catch {
        if (!active) return;
        setIssues([]);
        setAnnouncements([]);
        setGalleryPosts([]);
      } finally {
        if (active) setIsLoading(false);
        if (active) setIsGalleryLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const collegeName = session?.user?.college || "Your College";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Campus Resident";
  const userRole = session?.user?.role || "student";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CR";

  const roleLabel =
    userRole === "management"
      ? "Management"
      : userRole === "maintenance"
        ? "Maintenance"
        : "Student";

  const leaders = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    issues.forEach((issue) => {
      const reporter = issue.reporter;
      if (!reporter?._id) return;
      const existing = map.get(reporter._id) || {
        id: reporter._id,
        name: reporter.name || "Community member",
        count: 0,
      };
      existing.count += 1;
      map.set(reporter._id, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [issues]);

  const stats = useMemo(() => {
    const open = issues.filter((i) => i.status !== "resolved").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    const totalUpvotes = issues.reduce((sum, i) => sum + (i.upvoteCount ?? i.upvotes ?? 0), 0);
    return { open, resolved, totalUpvotes };
  }, [issues]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500" />
            <div>
              <p className="text-sm text-white/60">HostelHub</p>
              <p className="text-lg font-semibold">Home</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <Link href="/" className="text-white">Home</Link>
            <Link href="/issues">Community</Link>
            <Link href="/gallery">Hostel Gallery</Link>
            <Link href="/announcements">Announcements</Link>
            <Link href="/qr-scanner">QR Scan</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/issues/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-6">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold ring-1 ring-white/10">
                  {userInitials}
                </div>
                <div>
                  <p className="text-sm text-white/60">Welcome back</p>
                  <h2 className="text-2xl font-semibold text-white">{userName}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-200">{roleLabel}</Badge>
                    <Badge className="bg-white/10 text-white/70">{collegeName}</Badge>
                    <Badge className="bg-purple-500/20 text-purple-200">Community Member</Badge>
                  </div>
                </div>
              </div>
              <p className="text-white/70">
                Your profile powers a trusted, campus-first network. Keep your hostel community moving by
                surfacing what matters most.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button variant="outline">View My Activity</Button>
                </Link>
                <Link href="/issues/new">
                  <Button className="gap-2">
                    Report Issue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Your Impact</p>
                    <p className="text-xs text-white/60">Upvotes + resolutions at a glance</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-200">Live</Badge>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-xs text-white/60">Open</p>
                    <p className="text-lg font-semibold text-white">{stats.open}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-xs text-white/60">Resolved</p>
                    <p className="text-lg font-semibold text-white">{stats.resolved}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-xs text-white/60">Upvotes</p>
                    <p className="text-lg font-semibold text-white">{stats.totalUpvotes}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="image-frame tilt-surface h-48 overflow-hidden">
                <div className="image-layer" />
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <Badge className="bg-white/10 text-white/80">Campus Overview</Badge>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                    <p className="text-xs text-white/70">Live activity</p>
                    <p className="text-lg font-semibold text-white">{stats.open} open reports</p>
                  </div>
                </div>
              </div>
              <Card className="bg-white/5 border-white/10 tilt-surface">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Crown className="h-5 w-5 text-amber-300" />
                    Campus Leaders
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Profiles driving the most reports this week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaders.length === 0 && (
                    <p className="text-sm text-white/60">Leaders will appear as reports come in.</p>
                  )}
                  {leaders.map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold">
                          {leader.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join("") || "CM"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{leader.name}</p>
                          <p className="text-xs text-white/60">{leader.count} reports</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-200">Top</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 tilt-surface">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5 text-sky-300" />
                    Community Momentum
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {stats.open} open reports • {stats.resolved} resolved • {stats.totalUpvotes} upvotes
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-white/70">
                  Keep momentum high by tracking trends and rallying support for urgent issues.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Campus Profiles</h3>
              <p className="text-sm text-white/60">Top contributors and trusted peers</p>
            </div>
            <Link href="/issues" className="text-sm text-white/70 hover:text-white">
              View all
            </Link>
          </div>
          {leaders.length === 0 ? (
            <Card className="mt-4 border-white/10 bg-white/5">
              <CardContent className="p-4 text-sm text-white/60">
                No community profiles yet. First reports will appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {leaders.map((leader) => (
                <Card key={leader.id} className="bg-white/5 border-white/10">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
                      {leader.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join("") || "CM"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{leader.name}</p>
                      <p className="text-xs text-white/60">{leader.count} reports • {collegeName}</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-200">Verified</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge className="bg-purple-500/20 text-purple-200">
              Community for {collegeName}
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Resolve hostel issues faster with a campus-first community.
            </h1>
            <p className="text-lg text-white/70">
              Track trending complaints, share updates, and keep maintenance accountable with
              transparent status timelines.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/issues">
                <Button className="gap-2">
                  View Community Feed
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">My Activity</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Open</CardTitle>
                <CardDescription className="text-white/60">Issues trending now</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{stats.open}</CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Resolved</CardTitle>
                <CardDescription className="text-white/60">Community wins</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{stats.resolved}</CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Upvotes</CardTitle>
                <CardDescription className="text-white/60">Support signals</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{stats.totalUpvotes}</CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Trending Reports
              </CardTitle>
              <CardDescription className="text-white/60">
                Highest upvoted issues from your college
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              )}
              {!isLoading && issues.length === 0 && (
                <p className="text-sm text-white/60">No trending issues yet.</p>
              )}
              {!isLoading && issues.map((issue) => {
                const status = STATUS_LABELS.find((s) => s.id === issue.status);
                return (
                  <Link
                    key={issue._id}
                    href={`/issues/${issue._id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                  >
                    <div>
                      <p className="font-medium text-white">{issue.title}</p>
                      <p className="text-xs text-white/60">
                        {formatRelativeTime(issue.createdAt)} • {issue.upvoteCount ?? issue.upvotes ?? 0} upvotes
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "border-none",
                        status?.color ? "" : "bg-white/10 text-white"
                      )}
                      style={status?.color ? { backgroundColor: `${status.color}25`, color: status.color } : undefined}
                    >
                      {status?.name || issue.status}
                    </Badge>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Flame className="h-5 w-5 text-orange-400" />
                Trending Announcements
              </CardTitle>
              <CardDescription className="text-white/60">Latest hostel updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              )}
              {!isLoading && announcements.length === 0 && (
                <p className="text-sm text-white/60">No announcements yet.</p>
              )}
              {!isLoading && announcements.map((announcement) => (
                <Link
                  key={announcement._id}
                  href={`/announcements/${announcement._id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white/10 text-white/80">
                      {announcement.type || announcement.priority || "general"}
                    </Badge>
                    <span className="text-xs text-white/60">
                      {formatRelativeTime(announcement.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {announcement.title}
                  </p>
                  <p className="text-xs text-white/60 line-clamp-2">
                    {announcement.content}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Hostel Gallery</h3>
              <p className="text-sm text-white/60">Latest moments from your hostel community</p>
            </div>
            <Link href="/gallery" className="text-sm text-white/70 hover:text-white">
              View gallery
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <GalleryUploadCard
              title="Add to Gallery"
              description="Share a photo that will appear in the main gallery feed."
            />
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Images className="h-5 w-5 text-purple-300" />
                  Latest Photos
                </CardTitle>
                <CardDescription className="text-white/60">
                  Fresh uploads from campus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGalleryLoading && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                )}
                {!isGalleryLoading && galleryPosts.length === 0 && (
                  <p className="text-sm text-white/60">No gallery posts yet.</p>
                )}
                {!isGalleryLoading && galleryPosts.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {galleryPosts.map((post) => (
                      <div key={post._id} className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={post.imageUrl}
                            alt={post.caption || "Gallery photo"}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                          <div className="absolute inset-x-0 bottom-0 p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <p className="font-semibold">{post.uploadedBy?.name || "Hosteler"}</p>
                            {post.caption && <p className="text-white/80 line-clamp-2">{post.caption}</p>}
                          </div>
                        </div>
                        <div className="p-3 text-xs text-white/60">
                          {formatRelativeTime(post.uploadDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-purple-300" />
                AI Insight
              </CardTitle>
              <CardDescription className="text-white/60">
                Smart prioritization for faster resolution.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-white/70">
              Focus on high-impact hostel fixes using community upvotes and status signals.
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                Verified Updates
              </CardTitle>
              <CardDescription className="text-white/60">Only management can resolve.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-white/70">
              Every status change is tracked, ensuring accountability and transparency.
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-sky-300" />
                Community Heatmap
              </CardTitle>
              <CardDescription className="text-white/60">Know what matters most.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-white/70">
              Track patterns across hostel blocks to prioritize repairs.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}