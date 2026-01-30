"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Images, Heart, MessageCircle, Share2 } from "lucide-react";

interface GalleryPost {
  _id: string;
  imageUrl: string;
  publicId?: string;
  caption?: string;
  hostel: string;
  uploadDate: string;
  academicYear?: string;
  likeCount?: number;
  isLiked?: boolean;
  comments?: Array<{
    _id?: string;
    user?: {
      name?: string;
      avatar?: string;
    };
    comment: string;
    createdAt: string;
  }>;
  uploadedBy?: {
    name?: string;
    avatar?: string;
    hostel?: string;
    isVerified?: boolean;
  };
}

type GalleryGroups = Record<string, Record<string, GalleryPost[]>>;

export default function GalleryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPost = useMemo(
    () => posts.find((post) => post._id === selectedPostId) || null,
    [posts, selectedPostId]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [router, status]);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery?limit=200");
      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const groupedPosts = useMemo(() => {
    return posts.reduce<GalleryGroups>((acc, post) => {
      const date = new Date(post.uploadDate);
      const yearKey = date.getFullYear().toString();
      const dayKey = format(date, "MMM d, yyyy");

      if (!acc[yearKey]) {
        acc[yearKey] = {};
      }
      if (!acc[yearKey][dayKey]) {
        acc[yearKey][dayKey] = [];
      }
      acc[yearKey][dayKey].push(post);
      return acc;
    }, {});
  }, [posts]);

  const yearKeys = useMemo(() => {
    return Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a));
  }, [groupedPosts]);

  return (
    <AppShell title="Hostel Gallery">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Images className="h-6 w-6 text-purple-400" />
              <h1 className="text-2xl font-semibold text-white">Hostel Gallery</h1>
            </div>
            <p className="text-sm text-white/60">
              See hostel moments, organized by year and date.
            </p>
          </div>
          <Link href="/dashboard/gallery">
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Upload photos
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-white/10 bg-white/5">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-52 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="py-12 text-center text-white/70">
              No photos yet. Be the first to share your hostel moments.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {yearKeys.map((year) => (
              <div key={year} className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{year}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {Object.values(groupedPosts[year]).reduce((count, group) => count + group.length, 0)} posts
                  </Badge>
                </div>

                <div className="space-y-8">
                  {Object.keys(groupedPosts[year]).map((dayKey) => (
                    <div key={dayKey} className="space-y-4">
                      <p className="text-sm uppercase tracking-wide text-white/50">{dayKey}</p>
                      <div className="grid gap-6 md:grid-cols-2">
                        {groupedPosts[year][dayKey].map((post) => (
                          <Card
                            key={post._id}
                            className="border-white/10 bg-white/5 overflow-hidden cursor-pointer"
                            onClick={() => {
                              setSelectedPostId(post._id);
                              setCommentDraft("");
                            }}
                          >
                            <CardHeader className="flex flex-row items-center gap-3">
                              <UserAvatar
                                name={post.uploadedBy?.name || "Hosteler"}
                                image={post.uploadedBy?.avatar}
                                size="sm"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">
                                  {post.uploadedBy?.name || "Hosteler"}
                                </p>
                                <p className="text-xs text-white/60">
                                  {post.hostel}
                                </p>
                              </div>
                              {post.uploadedBy?.isVerified && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Verified
                                </Badge>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="group relative overflow-hidden rounded-lg aspect-[4/3]">
                                <Image
                                  src={post.imageUrl}
                                  alt={post.caption || "Hostel gallery photo"}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="absolute inset-x-0 bottom-0 p-4 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  <p className="font-semibold">{post.uploadedBy?.name || "Hosteler"}</p>
                                  {post.caption && <p className="text-white/80">{post.caption}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                {post.academicYear && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    {post.academicYear}
                                  </Badge>
                                )}
                                <span>{format(new Date(post.uploadDate), "PPP")}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPostId(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedPost && (
            <div className="grid gap-0 md:grid-cols-[1.2fr_1fr] bg-slate-950 text-white">
              <div className="relative min-h-[260px] bg-black">
                <Image
                  src={selectedPost.imageUrl}
                  alt={selectedPost.caption || "Hostel gallery photo"}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <DialogHeader className="px-5 pt-5">
                  <DialogTitle className="text-lg">Hostel Moments</DialogTitle>
                </DialogHeader>

                <div className="px-5 flex items-center gap-3 border-b border-white/10 pb-4">
                  <UserAvatar
                    name={selectedPost.uploadedBy?.name || "Hosteler"}
                    image={selectedPost.uploadedBy?.avatar}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {selectedPost.uploadedBy?.name || "Hosteler"}
                    </p>
                    <p className="text-xs text-white/60">
                      {selectedPost.hostel}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {format(new Date(selectedPost.uploadDate), "PPP")}
                  </Badge>
                </div>

                {selectedPost.caption && (
                  <div className="px-5 py-4 text-sm text-white/80">
                    {selectedPost.caption}
                  </div>
                )}

                <div className="px-5 flex items-center gap-4 border-t border-white/10 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      const postId = selectedPost._id;
                      setPosts((prev) =>
                        prev.map((p) =>
                          p._id === postId
                            ? {
                                ...p,
                                isLiked: !p.isLiked,
                                likeCount: Math.max((p.likeCount || 0) + (p.isLiked ? -1 : 1), 0),
                              }
                            : p
                        )
                      );
                      try {
                        const response = await fetch(`/api/gallery/${postId}/like`, { method: "POST" });
                        const data = response.ok ? await response.json() : null;
                        if (!data) throw new Error("Failed");
                        setPosts((prev) =>
                          prev.map((p) =>
                            p._id === postId
                              ? { ...p, isLiked: data.isLiked, likeCount: data.likeCount }
                              : p
                          )
                        );
                        await fetchGallery();
                      } catch {
                        setPosts((prev) => prev);
                      }
                    }}
                  >
                    <Heart className={selectedPost.isLiked ? "fill-pink-500 text-pink-500" : ""} />
                    {selectedPost.likeCount ?? 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle />
                    {selectedPost.comments?.length ?? 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      const url = `${window.location.origin}/gallery?post=${selectedPost._id}`;
                      await navigator.clipboard.writeText(url);
                    }}
                  >
                    <Share2 />
                    Share
                  </Button>
                </div>

                <div className="px-5 py-4 space-y-4 flex-1 overflow-auto">
                  {(selectedPost.comments || []).map((comment, index) => (
                    <div key={comment._id || index} className="flex items-start gap-3">
                      <UserAvatar
                        name={comment.user?.name || "User"}
                        image={comment.user?.avatar}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {comment.user?.name || "User"}
                        </p>
                        <p className="text-sm text-white/80">{comment.comment}</p>
                        <p className="text-xs text-white/50">
                          {format(new Date(comment.createdAt), "PPP p")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(selectedPost.comments || []).length === 0 && (
                    <p className="text-sm text-white/50">No comments yet.</p>
                  )}
                </div>

                <div className="border-t border-white/10 px-5 py-4">
                  <div className="flex items-end gap-3">
                    <Textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Add a comment..."
                      className="min-h-[80px] bg-white/5 border-white/10 text-white"
                    />
                    <Button
                      className="shrink-0"
                      disabled={isSubmitting || !commentDraft.trim()}
                      onClick={async () => {
                        if (!selectedPost) return;
                        setIsSubmitting(true);
                        try {
                          const response = await fetch(`/api/gallery/${selectedPost._id}/comments`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ comment: commentDraft }),
                          });
                          if (!response.ok) throw new Error("Failed");
                          const data = await response.json();
                          setPosts((prev) =>
                            prev.map((p) =>
                              p._id === selectedPost._id
                                ? {
                                    ...p,
                                    comments: [...(p.comments || []), data.comment],
                                  }
                                : p
                            )
                          );
                          setCommentDraft("");
                          await fetchGallery();
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}