import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Issue, User, Notification } from "@/models";
import { sendEmail } from "@/lib/email";
import { predictUrgency } from "@/lib/ai";

// GET - Fetch all issues with filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const hostel = searchParams.get("hostel");
    const search = searchParams.get("search");
    const sortByParam = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const onlyMine = searchParams.get("onlyMine") === "true";
    const upvoted = searchParams.get("upvoted") === "true";
    const isPublic = searchParams.get("isPublic");
    const scope = searchParams.get("scope");
    const assignedTo = searchParams.get("assignedTo");

    const session = await getServerSession(authOptions);

    // Build query
    const query: Record<string, unknown> = {};

    // Only show public issues for non-authenticated users
    if (!session?.user) {
      query.isPublic = true;
    } else if (onlyMine) {
      query.reporter = session.user.id;
    } else if (upvoted) {
      query.upvotes = session.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo === "me" ? session.user.id : assignedTo;
    } else if (scope === "college") {
      // Allow full college feed for community pages
    } else if (isPublic === "true") {
      query.isPublic = true;
    } else if (session.user.role === "student") {
      // Students can see their own issues + public issues
      query.$or = [{ reporter: session.user.id }, { isPublic: true }];
    }
    // Management and maintenance can see all issues

    // Apply filters
    if (category) {
      query.category = { $in: category.split(",") };
    }
    if (priority) {
      query.priority = { $in: priority.split(",") };
    }
    if (status) {
      query.status = { $in: status.split(",") };
    }
    if (hostel) {
      query.hostel = { $in: hostel.split(",") };
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    const sortBy = sortByParam === "upvotes"
      ? "upvoteCount"
      : sortByParam === "views"
        ? "viewCount"
        : sortByParam;
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const skip = (page - 1) * limit;
    
    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate("reporter", "name email avatar role isVerified")
        .populate("assignedTo", "name email avatar role isVerified")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query),
    ]);

    // Add upvoted/bookmarked status for current user
    const enrichedIssues = issues.map((issue) => {
      const upvoteCount = typeof issue.upvoteCount === "number"
        ? issue.upvoteCount
        : issue.upvotes?.length || 0;

      return {
        ...issue,
        upvotes: upvoteCount,
        upvoteCount,
        views: issue.viewCount ?? 0,
        isUpvoted: session?.user?.id
          ? issue.upvotes?.some((u: any) => u.toString() === session.user.id)
          : false,
        comments: issue.comments?.length || 0,
      };
    });

    return NextResponse.json({
      issues: enrichedIssues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

// POST - Create new issue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const hostel = formData.get("hostel") as string;
    const block = formData.get("block") as string;
    const floor = formData.get("floor") as string;
    const room = formData.get("room") as string;
    const isPublic = formData.get("isPublic") === "true";

    // Validate required fields
    if (!title || !description || !category || !hostel || !block || !floor || !room) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const urgency = await predictUrgency(`${title} ${description}`);
    const mappedPriority = urgency.urgencyLevel === "red"
      ? "emergency"
      : urgency.urgencyLevel === "high"
        ? "high"
        : urgency.urgencyLevel === "low"
          ? "low"
          : "medium";

    // Handle file uploads (in production, upload to cloud storage)
    const files = formData.getAll("files") as File[];
    const images: string[] = [];
    
    // For now, we'll skip actual file upload
    // In production, upload to S3/Cloudinary and store URLs
    
    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      priority: mappedPriority || priority || "medium",
      urgencyLevel: urgency.urgencyLevel,
      urgencyScore: urgency.urgencyScore,
      college: session.user.college,
      hostel,
      block,
      floor,
      room,
      isPublic,
      images,
      reporter: session.user.id,
      statusHistory: [
        {
          status: "reported",
          timestamp: new Date(),
          updatedBy: session.user.id,
          remarks: "Issue created",
        },
      ],
    });

    // Update user's karma points for reporting
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { karmaPoints: 5 },
      $push: { 
        reportedIssues: issue._id,
        karmaHistory: {
          action: "issue_reported",
          points: 5,
          description: `Reported issue: ${title}`,
        },
      },
    });

    // Create notification for management
    const managementUsers = await User.find({
      role: "management",
      hostel: hostel,
      ...(session.user.college ? { college: session.user.college } : {}),
    }).select("_id");

    const notifications = managementUsers.map((user) => ({
      user: user._id,
      type: "new_issue",
      title: "New Issue Reported",
      message: `New ${category} issue: ${title}`,
      relatedIssue: issue._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    if (urgency.urgencyLevel === "red") {
      const managementUsers = await User.find({
        role: "management",
        hostel: hostel,
        ...(session.user.college ? { college: session.user.college } : {}),
      }).select("email name");

      const wardenEmail = process.env.WARDEN_EMAIL || "srijitdas028@gmail.com";
      const emails = new Set(
        managementUsers.map((user) => user.email).filter(Boolean) as string[]
      );
      if (wardenEmail) {
        emails.add(wardenEmail);
      }
      if (emails.size > 0) {
        const issueUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/issues/${issue._id}`;
        await sendEmail({
          to: Array.from(emails),
          subject: "🚨 Red Alert: Critical Hostel Issue Reported",
          html: `
            <h2 style="color:#dc2626">Red Alert: ${title}</h2>
            <p><strong>Hostel:</strong> ${hostel}</p>
            <p><strong>Reported by:</strong> ${session.user.name || session.user.email}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Urgency Score:</strong> ${urgency.urgencyScore}</p>
            <p><a href="${issueUrl}">Open issue details</a></p>
          `,
        });
      }
    }

    // Auto-assign based on category (optional - depends on business logic)
    // This can be expanded to use AI/ML for smart assignment

    return NextResponse.json({
      id: issue._id,
      message: "Issue created successfully",
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
