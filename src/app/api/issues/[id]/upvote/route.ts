import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Issue, User } from "@/models";

// POST - Toggle upvote on issue
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

    const issue = await Issue.findById(id);

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    if (session.user.college && issue.college && issue.college !== session.user.college) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userId = session.user.id;
    const hasUpvoted = issue.upvotes?.some((u: any) => u.toString() === userId);

    if (hasUpvoted) {
      // Remove upvote
      await Issue.findByIdAndUpdate(id, {
        $pull: { upvotes: userId },
        $inc: { upvoteCount: -1 },
      });

      // Remove karma from reporter
      await User.findByIdAndUpdate(issue.reporter, {
        $inc: { karmaPoints: -1 },
      });

      return NextResponse.json({ upvoted: false, message: "Upvote removed" });
    } else {
      // Add upvote
      await Issue.findByIdAndUpdate(id, {
        $addToSet: { upvotes: userId },
        $inc: { upvoteCount: 1 },
      });

      // Award karma to reporter
      await User.findByIdAndUpdate(issue.reporter, {
        $inc: { karmaPoints: 1 },
        $push: {
          karmaHistory: {
            action: "issue_upvoted",
            points: 1,
            description: `Issue upvoted: ${issue.title}`,
          },
        },
      });

      return NextResponse.json({ upvoted: true, message: "Issue upvoted" });
    }
  } catch (error) {
    console.error("Error toggling upvote:", error);
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}
