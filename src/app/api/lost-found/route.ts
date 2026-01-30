import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LostFound from "@/models/LostFound";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // lost or found
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const hostel = searchParams.get("hostel");

    const query: any = { college: session.user.college };
    
    if (type && (type === "lost" || type === "found")) {
      query.type = type;
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (hostel) query["location.hostel"] = hostel;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LostFound.find(query)
        .populate("reporter", "name email hostel room avatar isVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LostFound.countDocuments(query),
    ]);

    const mapped = items.map((item: any) => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      type: item.type,
      location: item.location?.specificLocation || item.location?.hostel || "",
      hostel: item.location?.hostel,
      images: item.images || [],
      status: item.status === "active" ? "open" : item.status,
      createdAt: item.createdAt,
      reportedBy: item.reporter,
      views: item.views || 0,
      contactInfo: item.contactDetails,
    }));

    return NextResponse.json({
      items: mapped,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching lost/found items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
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

    await dbConnect();

    const body = await request.json();
    const {
      type,
      title,
      description,
      category,
      location,
      date,
      contactInfo,
      images,
    } = body;

    if (!type || !title || !description || !category) {
      return NextResponse.json(
        { error: "Type, title, description, and category are required" },
        { status: 400 }
      );
    }

    const item = await LostFound.create({
      type,
      title,
      description,
      category,
      college: session.user.college,
      location: {
        hostel: session.user.hostel || "",
        block: session.user.block || "",
        floor: session.user.floor || "",
        specificLocation: location || "",
      },
      date: date ? new Date(date) : new Date(),
      contactMethod: contactInfo ? "phone" : "app",
      contactDetails: contactInfo,
      images: images || [],
      reporter: session.user.id,
      status: "active",
    });

    await item.populate("reporter", "name email hostel room avatar isVerified");

    return NextResponse.json({
      _id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      type: item.type,
      location: item.location?.specificLocation || item.location?.hostel || "",
      hostel: item.location?.hostel,
      images: item.images || [],
      status: item.status === "active" ? "open" : item.status,
      createdAt: item.createdAt,
      reportedBy: item.reporter,
      views: item.views || 0,
      contactInfo: item.contactDetails,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating lost/found item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
