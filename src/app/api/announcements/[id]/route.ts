import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const announcement = await Announcement.findById(params.id)
      .populate("createdBy", "name email role")
      .lean();

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "management") {
      return NextResponse.json(
        { error: "Only management can update announcements" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { title, content, hostel, priority, isPinned, isActive, expiresAt } = body;

    const announcement = await Announcement.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...(title && { title }),
          ...(content && { content }),
          ...(hostel && { hostel }),
          ...(priority && { priority }),
          ...(isPinned !== undefined && { isPinned }),
          ...(isActive !== undefined && { isActive }),
          ...(expiresAt && { expiresAt: new Date(expiresAt) }),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate("createdBy", "name email role");

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "management") {
      return NextResponse.json(
        { error: "Only management can delete announcements" },
        { status: 403 }
      );
    }

    await dbConnect();

    const announcement = await Announcement.findByIdAndDelete(params.id);

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
