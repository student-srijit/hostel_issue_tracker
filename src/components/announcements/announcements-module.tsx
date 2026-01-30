"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Plus,
  Megaphone,
  AlertTriangle,
  Info,
  PartyPopper,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Pin,
  Edit2,
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  X,
  Send,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn, HOSTELS } from "@/lib/utils";

const typeIcons: Record<string, React.ReactNode> = {
  general: <Megaphone className="h-5 w-5" />,
  alert: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  event: <PartyPopper className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
  general: "#6366f1",
  alert: "#ef4444",
  info: "#3b82f6",
  event: "#10b981",
};

interface AnnouncementsModuleProps {
  showCreateButton?: boolean;
  onlyMine?: boolean;
}

export function AnnouncementsModule({ showCreateButton = true, onlyMine = false }: AnnouncementsModuleProps) {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isStaff = session?.user?.role === "management" || session?.user?.role === "maintenance";

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesType = selectedType === "all" || a.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned);

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncements = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        if (onlyMine) params.set("onlyMine", "true");
        const url = params.toString()
          ? `/api/announcements?${params.toString()}`
          : "/api/announcements";
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        if (isMounted) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("Failed to load announcements");
          setAnnouncements([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.hostel, onlyMine]);

  const handleLike = async (id: string) => {
    let previous: AnnouncementItem[] = [];
    setAnnouncements((prev) => {
      previous = prev;
      return prev.map((a) => {
        if (a._id !== id) return a;
        const currentCount = a.likeCount ?? a.likes ?? a.reactions?.likes?.length ?? 0;
        const nextLiked = !a.isLiked;
        const nextCount = Math.max(currentCount + (nextLiked ? 1 : -1), 0);
        return { ...a, isLiked: nextLiked, likeCount: nextCount };
      });
    });

    try {
      const response = await fetch(`/api/announcements/${id}/like`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to update like");
      }
      const data = await response.json();
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, likeCount: data.likeCount, isLiked: data.isLiked } : a
        )
      );
    } catch {
      setAnnouncements(previous);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-muted-foreground">
            Stay updated with the latest hostel news
          </p>
        </div>

        {showCreateButton && isStaff && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement for hostel residents
                </DialogDescription>
              </DialogHeader>
              <CreateAnnouncementForm
                onClose={() => setIsCreateOpen(false)}
                onCreated={(announcement) =>
                  setAnnouncements((prev) => [announcement, ...prev])
                }
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="alert" className="gap-1">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="event" className="gap-1">
              <PartyPopper className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-1">
              <Info className="h-4 w-4" />
              Info
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading announcements...</h3>
        </motion.div>
      )}

      {loadError && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{loadError}</h3>
          <p className="text-muted-foreground">Please refresh to try again.</p>
        </motion.div>
      )}

      {/* Pinned Announcements */}
      {!isLoading && !loadError && pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Pinned</h3>
          </div>
          <div className="grid gap-4">
            {pinnedAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                onLike={handleLike}
                isStaff={isStaff}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      {!isLoading && !loadError && (
      <div className="space-y-4">
        {pinnedAnnouncements.length > 0 && (
          <h3 className="font-semibold">Recent</h3>
        )}
        <AnimatePresence mode="popLayout">
          {regularAnnouncements.length > 0 ? (
            <div className="grid gap-4">
              {regularAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement._id}
                  announcement={announcement}
                  onLike={handleLike}
                  isStaff={isStaff}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No announcements</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No announcements match your search"
                  : "Check back later for updates"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
}

interface AnnouncementItem {
  _id?: string;
  title: string;
  content: string;
  type?: string;
  priority?: string;
  createdAt: string | Date;
  createdBy?: { name?: string; avatar?: string; role?: string; isVerified?: boolean };
  author?: { name?: string; avatar?: string; role?: string; isVerified?: boolean };
  isPinned?: boolean;
  views?: number;
  likes?: number;
  likeCount?: number;
  isLiked?: boolean;
  reactions?: { likes?: string[] };
  targetHostels?: string[];
  hostel?: string;
}

interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  onLike: (id: string) => void;
  isStaff: boolean;
}

function AnnouncementCard({ announcement, onLike, isStaff }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const author = announcement.createdBy || announcement.author;
  const authorBadge = author?.role === "management"
    ? "Management Announcement"
    : author?.isVerified
      ? "Verified Hosteler"
      : author?.role === "maintenance"
        ? "Staff"
        : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={cn(
          "transition-all hover:shadow-md",
          announcement.isPinned && "border-primary/50 bg-primary/5"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {(() => {
                const typeKey = (announcement.type && typeColors[announcement.type]
                  ? announcement.type
                  : "info") as keyof typeof typeColors;
                return (
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${typeColors[typeKey]}20` }}
                  >
                    <span style={{ color: typeColors[typeKey] }}>
                      {typeIcons[typeKey]}
                    </span>
                  </div>
                );
              })()}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {announcement.isPinned && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs capitalize">
                    {announcement.type || "info"}
                  </Badge>
                  {announcement.priority === "high" && (
                    <Badge variant="high" className="text-xs">
                      High Priority
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
              </div>
            </div>

            {isStaff && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pin className="mr-2 h-4 w-4" />
                    {announcement.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div
            className={cn(
              "text-sm text-muted-foreground whitespace-pre-wrap",
              !isExpanded && "line-clamp-3"
            )}
          >
            {announcement.content}
          </div>
          {announcement.content.length > 200 && (
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto mt-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : "Read more"}
            </Button>
          )}

          {(() => {
            const targets = announcement.targetHostels?.length
              ? announcement.targetHostels
              : announcement.hostel && announcement.hostel !== "all"
                ? [announcement.hostel]
                : [];
            return targets.length > 0 ? (
            <div className="flex items-center gap-2 mt-4">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                {targets.map((hostel) => (
                  <Badge key={hostel} variant="outline" className="text-xs">
                    {hostel}
                  </Badge>
                ))}
              </div>
            </div>
            ) : null;
          })()}
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author?.avatar || ""} />
                  <AvatarFallback>{author?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span>{author?.name || "Unknown"}</span>
                {authorBadge && (
                  <Badge variant="secondary" className="text-[10px]">
                    {authorBadge}
                  </Badge>
                )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={announcement.isLiked ? "secondary" : "ghost"}
              size="sm"
              className="gap-1"
              onClick={() => announcement._id && onLike(announcement._id)}
            >
              <ThumbsUp className="h-4 w-4" />
              {announcement.likeCount ?? announcement.likes ?? announcement.reactions?.likes?.length ?? 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <Eye className="h-4 w-4" />
              {announcement.views}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

interface CreateAnnouncementFormProps {
  onClose: () => void;
  onCreated: (announcement: any) => void;
}

function CreateAnnouncementForm({ onClose, onCreated }: CreateAnnouncementFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [targetHostels, setTargetHostels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          type: type === "general" ? "info" : type,
          priority,
          hostel: targetHostels[0] || "all",
          isPinned,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create announcement");
      }

      const created = await response.json();
      onCreated(created);
      onClose();
    } catch (error) {
      // keep dialog open on error
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your announcement..."
            className="min-h-[150px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Target Hostels (leave empty for all)</Label>
          <Select
            value={targetHostels[0] || ""}
            onValueChange={(value) => setTargetHostels(value ? [value] : [])}
          >
            <SelectTrigger>
              <SelectValue placeholder="All hostels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Hostels</SelectItem>
              {HOSTELS.map((hostel) => (
                <SelectItem key={hostel} value={hostel}>
                  {hostel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4" />
            <span className="text-sm font-medium">Pin this announcement</span>
          </div>
          <Switch checked={isPinned} onCheckedChange={setIsPinned} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!title || !content || isSubmitting}>
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </DialogFooter>
    </div>
  );
}
