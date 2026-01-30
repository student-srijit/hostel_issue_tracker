"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  ArrowUp,
  Eye,
  Clock,
  MapPin,
  Image as ImageIcon,
  MoreHorizontal,
  Flag,
  Share2,
  Bookmark,
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, STATUS_LABELS } from "@/lib/utils";

interface IssueCardProps {
  issue: {
    _id: string;
    issueNumber: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    hostel: string;
    block: string;
    floor: string;
    room: string;
    isPublic: boolean;
    images: string[];
    upvotes: number;
    comments: number;
    views: number;
    createdAt: string | Date;
    reporter: {
      name: string;
      avatar?: string;
      role?: string;
      isVerified?: boolean;
    };
    assignedTo?: {
      name: string;
      avatar?: string;
    };
    isUpvoted?: boolean;
    isBookmarked?: boolean;
  };
  variant?: "default" | "compact" | "kanban";
  onUpvote?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-4 w-4" />,
  electrical: <Zap className="h-4 w-4" />,
  cleanliness: <Sparkles className="h-4 w-4" />,
  internet: <Wifi className="h-4 w-4" />,
  furniture: <Armchair className="h-4 w-4" />,
  structural: <Building2 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  ac_heating: <Thermometer className="h-4 w-4" />,
  pest_control: <Bug className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

export function IssueCard({ issue, variant = "default", onUpvote, onBookmark }: IssueCardProps) {
  const category = ISSUE_CATEGORIES.find((c) => c.id === issue.category);
  const priority = PRIORITY_LEVELS.find((p) => p.id === issue.priority);
  const status = STATUS_LABELS.find((s) => s.id === issue.status);

  const initials = issue.reporter.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const reporterRole = issue.reporter.role;
  const reporterBadge = issue.reporter.isVerified
    ? "Verified Hosteler"
    : reporterRole === "management"
      ? "Verified"
      : reporterRole === "maintenance"
        ? "Staff"
        : null;

  // Compact variant for kanban boards
  if (variant === "kanban") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Link href={`/issues/${issue._id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category?.color}20` }}
                >
                  <span style={{ color: category?.color }}>
                    {categoryIcons[issue.category]}
                  </span>
                </div>
                <Badge variant={issue.priority as "low" | "medium" | "high" | "emergency"} className="text-xs">
                  {issue.priority}
                </Badge>
              </div>

              <h3 className="font-medium line-clamp-2 mb-2">{issue.title}</h3>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {issue.hostel} {issue.block}-{issue.room}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={issue.reporter.avatar} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{issue.reporter.name}</span>
                  {reporterBadge && (
                    <Badge variant="secondary" className="text-[10px]">
                      {reporterBadge}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {issue.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {issue.comments}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/issues/${issue._id}`}>
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div
              className="p-2 rounded-lg shrink-0"
              style={{ backgroundColor: `${category?.color}20` }}
            >
              <span style={{ color: category?.color }}>
                {categoryIcons[issue.category]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved" | "rejected"} className="text-xs">
                  {status?.name}
                </Badge>
                {reporterBadge && (
                  <Badge variant="secondary" className="text-xs">
                    {reporterBadge}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">#{issue.issueNumber}</span>
              </div>
              <h3 className="font-medium truncate">{issue.title}</h3>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {issue.hostel} • Block {issue.block} • {issue.room}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                  {reporterBadge && (
                    <Badge variant="secondary" className="text-xs">
                      {reporterBadge}
                    </Badge>
                  )}
                <ArrowUp className="h-4 w-4" />
                <span>{issue.upvotes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{issue.comments}</span>
              </div>
              <span className="text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${category?.color}20` }}
              >
                <span style={{ color: category?.color }}>
                  {categoryIcons[issue.category]}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={issue.status as "reported" | "assigned" | "in_progress" | "resolved" | "rejected"} className="text-xs">
                    {status?.name}
                  </Badge>
                  <Badge variant={issue.priority as "low" | "medium" | "high" | "emergency"} className="text-xs">
                    {issue.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  #{issue.issueNumber} • {category?.name}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBookmark?.(issue._id)}>
                  <Bookmark className={cn("mr-2 h-4 w-4", issue.isBookmarked && "fill-current")} />
                  {issue.isBookmarked ? "Unbookmark" : "Bookmark"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <Link href={`/issues/${issue._id}`} className="block">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
              {issue.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {issue.description}
            </p>

            {issue.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {issue.images.slice(0, 3).map((image, index) => (
                  <div
                    key={index}
                    className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image}
                      alt={`Issue image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 2 && issue.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{issue.images.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {issue.hostel} • Block {issue.block} • Floor {issue.floor} • Room {issue.room}
              </span>
            </div>
          </Link>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={issue.reporter.avatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{issue.reporter.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1",
                      issue.isUpvoted && "text-primary"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      onUpvote?.(issue._id);
                    }}
                  >
                    <ArrowUp className={cn("h-4 w-4", issue.isUpvoted && "fill-current")} />
                    <span>{issue.upvotes}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upvote this issue</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{issue.comments}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comments</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{issue.views}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Views</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>

        {issue.assignedTo && (
          <div className="px-4 py-2 bg-muted/50 border-t flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Assigned to</span>
            <Avatar className="h-5 w-5">
              <AvatarImage src={issue.assignedTo.avatar} />
              <AvatarFallback className="text-xs">
                {issue.assignedTo.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{issue.assignedTo.name}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
