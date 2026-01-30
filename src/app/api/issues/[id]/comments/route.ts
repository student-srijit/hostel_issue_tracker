import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Issue, User, Notification } from "@/models";

// POST - Add comment to issue
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

    const { content, isInternal } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (session.user.college && issue.college && issue.college !== session.user.college) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const comment = {
      user: session.user.id,
      content: content.trim(),
      isInternal: isInternal && ["management", "maintenance"].includes(session.user.role),
      createdAt: new Date(),
    };

    const updated = await Issue.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    ).populate("comments.user", "name avatar role isVerified");

    // Award karma for commenting
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { karmaPoints: 2 },
    });

    // Notify relevant users
    const notifyUsers: string[] = [];

    // Notify reporter if commenter is staff
    if (
      ["management", "maintenance"].includes(session.user.role) &&
      issue.reporter.toString() !== session.user.id
    ) {
      notifyUsers.push(issue.reporter.toString());
    }

    // Notify assigned staff if commenter is reporter
    if (
      session.user.id === issue.reporter.toString() &&
      issue.assignedTo
    ) {
      notifyUsers.push(issue.assignedTo.toString());
    }

    // Create notifications
    for (const userId of notifyUsers) {
      await Notification.create({
        recipient: userId,
        type: "comment",
        title: "New Comment",
        message: `New comment on issue "${issue.title}"`,
        data: {
          issueId: issue._id,
        },
      });
    }

    const newComment = updated?.comments?.[updated.comments.length - 1];

    return NextResponse.json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
