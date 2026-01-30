import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Issue, User } from "@/models";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "management") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const staff = await User.find({ role: "maintenance", isActive: true, lastLogin: { $ne: null } })
      .select("name email avatar employeeId department specialization hostel phone lastLogin")
      .lean();

    const staffIds = staff.map((s: any) => s._id);

    const assignments = await Issue.aggregate([
      { $match: { assignedTo: { $in: staffIds } } },
      {
        $group: {
          _id: "$assignedTo",
          assignedCount: { $sum: 1 },
          resolvedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const assignmentMap = new Map(
      assignments.map((a: any) => [a._id.toString(), a])
    );

    const enriched = staff.map((member: any) => {
      const assignment = assignmentMap.get(member._id.toString());
      return {
        ...member,
        assignedCount: assignment?.assignedCount || 0,
        resolvedCount: assignment?.resolvedCount || 0,
      };
    });

    return NextResponse.json({ staff: enriched });
  } catch (error) {
    console.error("Error fetching staff list:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
