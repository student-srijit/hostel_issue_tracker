import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const isValidStudentId = (value: string) => /^[A-Za-z0-9][A-Za-z0-9-]{5,23}$/.test(value);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rawStudentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";

    if (!rawStudentId || !isValidStudentId(rawStudentId)) {
      return NextResponse.json(
        { error: "Enter a valid college ID to verify your hosteler status." },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await User.findOne({
      studentId: rawStudentId,
      _id: { $ne: session.user.id },
    }).select("_id");

    if (existing) {
      return NextResponse.json(
        { error: "This college ID is already linked to another account." },
        { status: 409 }
      );
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { studentId: rawStudentId, isVerified: true },
      { new: true }
    ).select("name email studentId isVerified role college");

    return NextResponse.json({
      user: updated,
    });
  } catch (error) {
    console.error("Error verifying student ID:", error);
    return NextResponse.json(
      { error: "Failed to verify college ID" },
      { status: 500 }
    );
  }
}
