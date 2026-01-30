import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { GalleryPost } from "@/models";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const comment = (body?.comment as string)?.trim();

    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    await dbConnect();

    const update = {
      $push: {
        comments: {
          user: session.user.id,
          comment,
          createdAt: new Date(),
        },
      },
    };

    const post = await GalleryPost.findByIdAndUpdate(params.id, update, {
      new: true,
      strict: false,
    }).populate({ path: "comments.user", select: "name avatar", strictPopulate: false });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newest = post.comments[post.comments.length - 1];

    return NextResponse.json({
      comment: newest,
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error("Error adding gallery comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
