import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import QRCodeModel from "@/models/QRCode";

const normalizeCode = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = new URL(trimmed, baseUrl);
    return url.toString();
  } catch {
    return trimmed;
  }
};

async function handleScan(codeInput: string, action: "view" | "report") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = normalizeCode(codeInput);

  if (!code) {
    return NextResponse.json({ error: "QR code is required" }, { status: 400 });
  }

  await dbConnect();

  const qrCode = await QRCodeModel.findOneAndUpdate(
    { code, isActive: true },
    {
      $push: {
        scans: {
          user: session.user.id,
          action,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  ).lean();

  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    qr: {
      code: qrCode.code,
      url: qrCode.url,
      hostel: qrCode.hostel,
      block: qrCode.block,
      floor: qrCode.floor,
      room: qrCode.room,
      location: qrCode.location,
      description: qrCode.description,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const codeInput = typeof body?.code === "string" ? body.code : "";
    const action = body?.action === "report" ? "report" : "view";
    return await handleScan(codeInput, action);
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return NextResponse.json({ error: "Failed to scan QR code" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codeInput = searchParams.get("code") || "";
    const action = searchParams.get("action") === "report" ? "report" : "view";
    return await handleScan(codeInput, action);
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return NextResponse.json({ error: "Failed to scan QR code" }, { status: 500 });
  }
}
