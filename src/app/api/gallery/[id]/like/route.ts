import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { GalleryPost } from "@/models";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const post = await GalleryPost.findById(params.id).select("likes");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const hasLiked = post.likes?.some((id: any) => id.toString() === userId);

    const update = hasLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updated = await GalleryPost.findByIdAndUpdate(params.id, update, {
      new: true,
      strict: false,
      select: "likes",
    });

    const likeCount = updated?.likes?.length || 0;

    return NextResponse.json({
      likeCount,
      isLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Error liking gallery post:", error);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 }
    );
  }
}
