import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: any = { recipient: session.user.id };
    if (unreadOnly) query.isRead = false;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: session.user.id, isRead: false }),
    ]);

    const mapped = notifications.map((notification: any) => ({
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      read: notification.isRead,
      link:
        notification.data?.link ||
        (notification.data?.issueId ? `/issues/${notification.data.issueId}` : undefined) ||
        (notification.data?.announcementId ? `/announcements/${notification.data.announcementId}` : undefined) ||
        (notification.data?.lostFoundId ? `/lost-found/${notification.data.lostFoundId}` : undefined),
    }));

    return NextResponse.json({
      notifications: mapped,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
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

    // Only management can create notifications
    if (session.user.role !== "management") {
      return NextResponse.json(
        { error: "Only management can create notifications" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { userId, type, title, message, link, data } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "userId, type, title, and message are required" },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      recipient: userId,
      type,
      title,
      message,
      data: {
        ...data,
        link,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// Mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { action, notificationId } = body;

    if (action === "markAllRead") {
      await Notification.updateMany(
        { recipient: session.user.id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (action === "markRead" && notificationId) {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: session.user.id },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true }
      );

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(notification);
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      await Notification.deleteMany({ recipient: session.user.id });
      return NextResponse.json({
        success: true,
        message: "All notifications deleted",
      });
    }

    if (notificationId) {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: session.user.id,
      });

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notification deleted",
      });
    }

    return NextResponse.json(
      { error: "Notification ID or 'all' parameter required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
