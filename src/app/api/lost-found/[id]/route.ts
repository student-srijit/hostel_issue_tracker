import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import LostFound from "@/models/LostFound";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const item = await LostFound.findById(params.id)
      .populate("reporter", "name email hostel room")
      .populate("claimedBy", "name email")
      .lean();

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
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

    await dbConnect();

    const body = await request.json();
    const { action, ...updateData } = body;

    // Handle claim action
    if (action === "claim") {
      const item = await LostFound.findById(params.id);
      
      if (!item) {
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      if (item.status === "claimed") {
        return NextResponse.json(
          { error: "Item has already been claimed" },
          { status: 400 }
        );
      }

      item.status = "claimed";
      item.claimedBy = new mongoose.Types.ObjectId(session.user.id);
      item.claimedAt = new Date();
      await item.save();

      await item.populate("reporter", "name email hostel room");
      await item.populate("claimedBy", "name email");

      return NextResponse.json(item);
    }

    // Handle status update
    if (action === "updateStatus" && updateData.status) {
      const item = await LostFound.findById(params.id);
      
      if (!item) {
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      // Only owner or management can update status
      if (
        item.reporter.toString() !== session.user.id &&
        session.user.role !== "management"
      ) {
        return NextResponse.json(
          { error: "Not authorized to update this item" },
          { status: 403 }
        );
      }

      item.status = updateData.status;
      await item.save();

      await item.populate("reporter", "name email hostel room");

      return NextResponse.json(item);
    }

    // Regular update
    const item = await LostFound.findById(params.id);
    
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Only owner or management can update
    if (
      item.reporter.toString() !== session.user.id &&
      session.user.role !== "management"
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this item" },
        { status: 403 }
      );
    }

    const { title, description, location, contactInfo, images } = updateData;

    const updatedItem = await LostFound.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...(title && { title }),
          ...(description && { description }),
          ...(location && { location }),
          ...(contactInfo && { contactInfo }),
          ...(images && { images }),
        },
      },
      { new: true }
    )
      .populate("reporter", "name email hostel room")
      .populate("claimedBy", "name email");

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
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

    await dbConnect();

    const item = await LostFound.findById(params.id);

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Only owner or management can delete
    if (
      item.reporter.toString() !== session.user.id &&
      session.user.role !== "management"
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this item" },
        { status: 403 }
      );
    }

    await LostFound.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
