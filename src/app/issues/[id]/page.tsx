"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  MessageSquare,
  Eye,
  Share2,
  Bookmark,
  Flag,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  Circle,
  CircleDot,
  XCircle,
  Send,
  MoreHorizontal,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Maximize2,
  Download,
  Copy,
  ExternalLink,
  Droplets,
  Zap,
  Sparkles,
  Wifi,
  Armchair,
  Building2,
  Shield,
  Thermometer,
  Bug,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, STATUS_LABELS } from "@/lib/utils";

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-5 w-5" />,
  electrical: <Zap className="h-5 w-5" />,
  cleanliness: <Sparkles className="h-5 w-5" />,
  internet: <Wifi className="h-5 w-5" />,
  furniture: <Armchair className="h-5 w-5" />,
  structural: <Building2 className="h-5 w-5" />,
  security: <Shield className="h-5 w-5" />,
  ac_heating: <Thermometer className="h-5 w-5" />,
  pest_control: <Bug className="h-5 w-5" />,
  other: <MoreHorizontal className="h-5 w-5" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  reported: <Circle className="h-4 w-4" />,
  assigned: <CircleDot className="h-4 w-4" />,
  in_progress: <CircleDot className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchIssue = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/issues/${params.id}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to load issue");
        }
        const data = await response.json();
        if (active) {
          setIssue(data);
        }
      } catch (error) {
        if (active) {
          setIssue(null);
          setLoadError(error instanceof Error ? error.message : "Failed to load issue");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchIssue();

    return () => {
      active = false;
    };
  }, [params.id]);

  const category = ISSUE_CATEGORIES.find((c) => c.id === issue?.category);
  const priority = PRIORITY_LEVELS.find((p) => p.id === issue?.priority);
  const status = STATUS_LABELS.find((s) => s.id === issue?.status);
  const reporterBadge = issue?.reporter?.isVerified
    ? "Verified Hosteler"
    : issue?.reporter?.role === "management"
      ? "Verified"
      : issue?.reporter?.role === "maintenance"
        ? "Staff"
        : null;

  const handleUpvote = async () => {
    if (!issue) return;
    const previous = issue;
    const nextUpvoted = !issue.isUpvoted;
    const nextCount = (issue.upvotes ?? issue.upvoteCount ?? 0) + (nextUpvoted ? 1 : -1);

    setIssue({
      ...issue,
      isUpvoted: nextUpvoted,
      upvotes: Math.max(nextCount, 0),
      upvoteCount: Math.max(nextCount, 0),
    });

    try {
      const response = await fetch(`/api/issues/${issue._id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to upvote");
      }
    } catch (error) {
      setIssue(previous);
      toast.error(error instanceof Error ? error.message : "Failed to upvote");
    }
  };

  const handleBookmark = () => {
    setIssue((prev: any) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : prev));
    toast.success(issue.isBookmarked ? "Bookmark removed" : "Issue bookmarked");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !issue) return;
    const content = comment.trim();
    setComment("");

    try {
      const response = await fetch(`/api/issues/${issue._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to post comment");
      }
      const data = await response.json();
      const newComment = data?.comment;
      setIssue((prev: any) => {
        if (!prev) return prev;
        const updatedComments = newComment
          ? [...(prev.comments || []), newComment]
          : prev.comments || [];
        return {
          ...prev,
          comments: updatedComments,
          commentCount: updatedComments.length,
        };
      });
      toast.success("Comment posted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post comment");
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Issue Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (loadError || !issue) {
    return (
      <AppShell title="Issue Details">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold">Unable to load issue</p>
              <p className="text-sm text-muted-foreground mt-2">
                {loadError || "Issue not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Issue Details">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Issues
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Issue Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start gap-3 mb-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${category?.color}20` }}
                  >
                    <span style={{ color: category?.color }}>
                      {categoryIcons[issue.category]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved" | "rejected"}>
                        {statusIcons[issue.status]}
                        <span className="ml-1">{status?.name}</span>
                      </Badge>
                      <Badge variant={issue.priority as "low" | "medium" | "high" | "emergency"}>
                        {issue.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        #{issue.issueNumber || issue._id?.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold">{issue.title}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(issue.isUpvoted && "text-primary border-primary")}
                            onClick={handleUpvote}
                          >
                            <ArrowUp className={cn("h-4 w-4", issue.isUpvoted && "fill-current")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Upvote</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(issue.isBookmarked && "text-yellow-500 border-yellow-500")}
                            onClick={handleBookmark}
                          >
                            <Bookmark className={cn("h-4 w-4", issue.isBookmarked && "fill-current")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bookmark</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Flag className="mr-2 h-4 w-4" />
                          Report Issue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {issue.hostel} • Block {issue.block} • Floor {issue.floor} • Room {issue.room}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowUp className="h-4 w-4" />
                    <span className="font-medium">{issue.upvoteCount ?? issue.upvotes ?? 0}</span>
                    <span className="text-muted-foreground">upvotes</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">{issue.comments?.length || issue.commentCount || 0}</span>
                    <span className="text-muted-foreground">comments</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">{issue.viewCount ?? 0}</span>
                    <span className="text-muted-foreground">views</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {issue.description.split("\n").map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            {issue.images?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Attachments ({issue.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.images.map((image: string, index: number) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                          >
                            <img
                              src={image}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img
                            src={image}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                          <DialogFooter>
                            <Button variant="outline" asChild>
                              <a href={image} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({issue.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comment Input */}
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitComment} disabled={!comment.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-6">
                  {(issue.comments || []).map((commentItem: any) => (
                    <motion.div
                      key={commentItem._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <Avatar>
                        <AvatarImage src={commentItem.user?.avatar || ""} />
                        <AvatarFallback>
                          {commentItem.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{commentItem.user?.name || "Unknown"}</span>
                          {commentItem.user?.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Hosteler
                            </Badge>
                          )}
                          {!commentItem.user?.isVerified && commentItem.user?.role === "maintenance" && (
                            <Badge variant="secondary" className="text-xs">
                              Staff
                            </Badge>
                          )}
                          {!commentItem.user?.isVerified && commentItem.user?.role === "management" && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(commentItem.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{commentItem.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" disabled>
                            <ThumbsUp className="h-3 w-3" />
                            {commentItem.likes ?? 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Reporter Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reported by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={issue.reporter.avatar} />
                    <AvatarFallback>{issue.reporter.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{issue.reporter.name}</p>
                      {reporterBadge && (
                        <Badge variant="secondary" className="text-xs">
                          {reporterBadge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.reporter.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned To Card */}
            {issue.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Assigned to</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={issue.assignedTo.avatar} />
                      <AvatarFallback>{issue.assignedTo.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{issue.assignedTo.name}</p>
                      <p className="text-sm text-muted-foreground">{issue.assignedTo.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(issue.statusHistory || []).map((history: any, index: number) => {
                    const historyStatus = STATUS_LABELS.find((s) => s.id === history.status);
                    const historyNote = history.remarks || history.note || "";
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="relative flex flex-col items-center">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${historyStatus?.color}20` }}
                          >
                            <span style={{ color: historyStatus?.color }}>
                              {statusIcons[history.status]}
                            </span>
                          </div>
                          {index < issue.statusHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 absolute top-8" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-sm">{historyStatus?.name}</p>
                          {historyNote && (
                            <p className="text-xs text-muted-foreground">{historyNote}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(history.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Flag className="h-4 w-4" />
                  Report as Inappropriate
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Issue Link
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Share on Social
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
