import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Issue, User, Notification } from "@/models";

// GET - Fetch single issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const session = await getServerSession(authOptions);

    const issue = await Issue.findById(id)
      .populate("reporter", "name email avatar role isVerified")
      .populate("assignedTo", "name email avatar role isVerified")
      .populate("comments.user", "name avatar role isVerified")
      .populate("statusHistory.updatedBy", "name")
      .lean();

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    if (session?.user?.college && issue.college && issue.college !== session?.user?.college) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check access permissions
    if (!issue.isPublic && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.college && issue.college && issue.college !== session.user.college) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (
      !issue.isPublic &&
      session?.user?.role === "student" &&
      issue.reporter._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Increment view count
    await Issue.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Add user-specific data
    const upvoteCount = typeof issue.upvoteCount === "number"
      ? issue.upvoteCount
      : issue.upvotes?.length || 0;

    const enrichedIssue = {
      ...issue,
      upvotes: upvoteCount,
      upvoteCount,
      isUpvoted: session?.user?.id
        ? issue.upvotes?.some((u: any) => u.toString() === session.user.id)
        : false,
      isBookmarked: false, // TODO: Implement bookmarks
    };

    return NextResponse.json(enrichedIssue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

// PATCH - Update issue
export async function PATCH(
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

    // Check permissions
    const isReporter = issue.reporter.toString() === session.user.id;
    const isStaff = ["management", "maintenance"].includes(session.user.role);
    const isManagement = session.user.role === "management";

    if (!isReporter && !isStaff) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { status, priority, assignedTo, note, title, description, isPublic } = body;

    const updates: Record<string, unknown> = {};

    // Reporter can only update certain fields
    if (isReporter && !isStaff) {
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (typeof isPublic === "boolean") updates.isPublic = isPublic;
    }

    // Staff can update status, priority, assignment
    if (isStaff) {
      if (priority) updates.priority = priority;
      if (assignedTo) updates.assignedTo = assignedTo;

      if (status && status !== issue.status) {
        if (!isManagement) {
          return NextResponse.json(
            { error: "Only management can change status" },
            { status: 403 }
          );
        }
        updates.status = status;
        updates.$push = {
          statusHistory: {
            status,
            timestamp: new Date(),
            updatedBy: session.user.id,
            remarks: note || `Status changed to ${status}`,
          },
        };

        // Create notification for reporter
        await Notification.create({
          recipient: issue.reporter,
          type: "issue_update",
          title: "Issue Status Updated",
          message: `Your issue "${issue.title}" is now ${status.replace("_", " ")}`,
          data: {
            issueId: issue._id,
          },
        });

        // Award karma for resolution
        if (status === "resolved") {
          await User.findByIdAndUpdate(issue.reporter, {
            $inc: { karmaPoints: 10 },
            $push: {
              karmaHistory: {
                action: "issue_resolved",
                points: 10,
                description: `Issue resolved: ${issue.title}`,
              },
            },
          });
        }
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate("reporter", "name email avatar role isVerified")
      .populate("assignedTo", "name email avatar role isVerified");

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

// DELETE - Delete issue
export async function DELETE(
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

    // Only reporter or management can delete
    const isReporter = issue.reporter.toString() === session.user.id;
    const isManagement = session.user.role === "management";

    if (!isReporter && !isManagement) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Soft delete by updating status
    await Issue.findByIdAndUpdate(id, {
      status: "closed",
      $push: {
        statusHistory: {
          status: "closed",
          timestamp: new Date(),
          changedBy: session.user.id,
          note: "Issue deleted by user",
        },
      },
    });

    // Remove from user's reported issues
    await User.findByIdAndUpdate(issue.reporter, {
      $pull: { reportedIssues: issue._id },
    });

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}
