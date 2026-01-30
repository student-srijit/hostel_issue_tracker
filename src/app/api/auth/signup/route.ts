import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      role,
      studentId,
      college,
      hostel,
      block,
      floor,
      room,
    } = body;

    const normalizedStudentId = typeof studentId === "string" && studentId.trim() !== "" ? studentId.trim() : undefined;

      if (!college) {
        return NextResponse.json(
          { error: "College is required" },
          { status: 400 }
        );
      }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Check if student ID is taken
    if (normalizedStudentId) {
      const existingStudentId = await User.findOne({ studentId: normalizedStudentId });
      if (existingStudentId) {
        return NextResponse.json(
          { error: "This student ID is already registered" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "student",
      ...(normalizedStudentId ? { studentId: normalizedStudentId } : {}),
      college,
      hostel,
      block,
      floor,
      room,
      isActive: true,
      isVerified: false,
      karmaScore: 0,
      badges: [],
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
      },
    });

    // Remove password from response
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { message: "Account created successfully", user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
