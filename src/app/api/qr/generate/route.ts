import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import dbConnect from "@/lib/db";
import QRCodeModel from "@/models/QRCode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only management can generate QR codes
    if (session.user.role !== "management") {
      return NextResponse.json(
        { error: "Only management can generate QR codes" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { location, hostel, block, floor, room, description } = body;

    if (!location || !hostel) {
      return NextResponse.json(
        { error: "Location and hostel are required" },
        { status: 400 }
      );
    }

    // Create base URL for the issue report form
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reportUrl = new URL("/issues/new", baseUrl);
    
    // Add location parameters
    reportUrl.searchParams.set("hostel", hostel);
    if (block) reportUrl.searchParams.set("block", block);
    if (floor) reportUrl.searchParams.set("floor", floor);
    if (room) reportUrl.searchParams.set("room", room);
    if (location) reportUrl.searchParams.set("location", location);

    const urlString = reportUrl.toString();

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(urlString, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });

    // Generate QR code as SVG for better printing
    const qrCodeSvg = await QRCode.toString(urlString, {
      type: "svg",
      width: 400,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    // Save QR code to database
    const qrCode = await QRCodeModel.create({
      code: urlString,
      location,
      hostel,
      block,
      floor,
      room,
      description,
      url: urlString,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode._id,
        dataUrl: qrCodeDataUrl,
        svg: qrCodeSvg,
        url: urlString,
        location,
        hostel,
        block,
        floor,
        room,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

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
    const hostel = searchParams.get("hostel");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = { isActive: true };
    if (hostel) query.hostel = hostel;

    const skip = (page - 1) * limit;

    const [qrCodes, total] = await Promise.all([
      QRCodeModel.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QRCodeModel.countDocuments(query),
    ]);

    const enriched = await Promise.all(
      qrCodes.map(async (qr) => {
        const dataUrl = await QRCode.toDataURL(qr.url || qr.code, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: "H",
        });
        const svg = await QRCode.toString(qr.url || qr.code, {
          type: "svg",
          width: 400,
          margin: 2,
          errorCorrectionLevel: "H",
        });
        return { ...qr, dataUrl, svg };
      })
    );

    return NextResponse.json({
      qrCodes: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}
