import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const hostel = searchParams.get("hostel");
    const priority = searchParams.get("priority");
    const pinned = searchParams.get("pinned");
    const onlyMine = searchParams.get("onlyMine") === "true";

    const query: any = { isPublished: true };

    // Filter by hostel or global
    if (hostel) {
      query.$or = [{ hostel }, { hostel: "all" }];
    }
    
    if (priority) query.priority = priority;
    if (pinned === "true") query.isPinned = true;
    if (onlyMine && session?.user?.id) {
      query.$or = [
        { createdBy: session.user.id },
        { author: session.user.id },
      ];
    }

    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate("createdBy", "name email role avatar isVerified")
        .populate("author", "name email role avatar isVerified")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments(query),
    ]);

    const enriched = announcements.map((announcement) => {
      const likeCount =
        typeof announcement.likes === "number"
          ? announcement.likes
          : announcement.reactions?.likes?.length || 0;
      const isLiked = session?.user?.id
        ? announcement.reactions?.likes?.some(
            (id: any) => id.toString() === session.user.id
          )
        : false;

      return {
        ...announcement,
        likeCount,
        isLiked,
      };
    });

    return NextResponse.json({
      announcements: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only management can create announcements
    if (session.user.role !== "management") {
      return NextResponse.json(
        { error: "Only management can create announcements" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { title, content, hostel, priority, type, isPinned, expiresAt, attachments } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const announcement = await Announcement.create({
      title,
      content,
      college: session.user.college,
      hostel: hostel || "all",
      priority: priority || "medium",
      type: type || "info",
      isPinned: isPinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      attachments: attachments || [],
      createdBy: session.user.id,
      author: session.user.id,
    });

    await announcement.populate("createdBy", "name email role avatar isVerified");

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
