import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    if (session.user.college && announcement.college && announcement.college !== session.user.college) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userId = session.user.id;
    if (!announcement.reactions) {
      announcement.reactions = { likes: [], helpful: [] } as any;
    }
    if (!announcement.reactions.likes) {
      announcement.reactions.likes = [] as any;
    }

    const liked = announcement.reactions.likes.some((like) => like.toString() === userId);

    if (liked) {
      announcement.reactions.likes = announcement.reactions.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      announcement.reactions.likes = [...announcement.reactions.likes, userId as any];
    }

    announcement.likes = announcement.reactions.likes.length;
    await announcement.save();

    return NextResponse.json({
      id: announcement._id,
      likeCount: announcement.likes,
      isLiked: !liked,
    });
  } catch (error) {
    console.error("Error toggling announcement like:", error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}