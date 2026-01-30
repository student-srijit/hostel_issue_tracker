import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import StaffPerformance from "@/models/StaffPerformance";
import User from "@/models/User";
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
    const period = searchParams.get("period") || "month"; // week, month, year
    const hostel = searchParams.get("hostel");
    const staffId = searchParams.get("staffId");

    let startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const query: any = {
      period: {
        $gte: startDate,
        $lte: new Date(),
      },
    };

    if (staffId) query.staffId = staffId;

    // Get performance records
    const performanceRecords = await StaffPerformance.find(query)
      .populate("staffId", "name email")
      .sort({ period: -1 })
      .lean();

    // Get leaderboard
    const leaderboard = await StaffPerformance.aggregate([
      {
        $match: {
          period: { $gte: startDate, $lte: new Date() },
        },
      },
      {
        $group: {
          _id: "$staffId",
          totalTasksCompleted: { $sum: "$tasksCompleted" },
          totalTasksAssigned: { $sum: "$tasksAssigned" },
          avgResponseTime: { $avg: "$averageResponseTime" },
          avgResolutionTime: { $avg: "$averageResolutionTime" },
          totalRatings: { $sum: "$customerSatisfaction.totalRatings" },
          avgRating: { $avg: "$customerSatisfaction.averageRating" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "staff",
        },
      },
      {
        $unwind: "$staff",
      },
      {
        $project: {
          name: "$staff.name",
          email: "$staff.email",
          tasksCompleted: "$totalTasksCompleted",
          tasksAssigned: "$totalTasksAssigned",
          completionRate: {
            $cond: [
              { $eq: ["$totalTasksAssigned", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalTasksCompleted", "$totalTasksAssigned"] },
                  100,
                ],
              },
            ],
          },
          avgResponseTime: { $round: ["$avgResponseTime", 2] },
          avgResolutionTime: { $round: ["$avgResolutionTime", 2] },
          avgRating: { $round: ["$avgRating", 2] },
          totalRatings: 1,
        },
      },
      {
        $sort: { tasksCompleted: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    // Add rank to leaderboard
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return NextResponse.json({
      performanceRecords,
      leaderboard: rankedLeaderboard,
      period,
    });
  } catch (error) {
    console.error("Error fetching staff performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff performance" },
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

    // Only management can update performance records
    if (session.user.role !== "management") {
      return NextResponse.json(
        { error: "Only management can update performance records" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      staffId,
      period,
      tasksAssigned,
      tasksCompleted,
      averageResponseTime,
      averageResolutionTime,
      customerSatisfaction,
      categoryBreakdown,
    } = body;

    if (!staffId || !period) {
      return NextResponse.json(
        { error: "staffId and period are required" },
        { status: 400 }
      );
    }

    // Check if staff exists
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "maintenance") {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Upsert performance record
    const performance = await StaffPerformance.findOneAndUpdate(
      { staffId, period: new Date(period) },
      {
        $set: {
          tasksAssigned,
          tasksCompleted,
          averageResponseTime,
          averageResolutionTime,
          customerSatisfaction,
          categoryBreakdown,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(performance, { status: 201 });
  } catch (error) {
    console.error("Error updating staff performance:", error);
    return NextResponse.json(
      { error: "Failed to update staff performance" },
      { status: 500 }
    );
  }
}

// Rate staff after task completion
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
    const { staffId, rating, feedback } = body;

    if (!staffId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "staffId and rating (1-5) are required" },
        { status: 400 }
      );
    }

    // Get current month's performance record
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let performance = await StaffPerformance.findOne({
      staffId,
      period: startOfMonth,
    });

    if (!performance) {
      // Create new record if doesn't exist
      performance = await StaffPerformance.create({
        staffId,
        period: startOfMonth,
        tasksAssigned: 0,
        tasksCompleted: 0,
        averageResponseTime: 0,
        averageResolutionTime: 0,
        customerSatisfaction: {
          totalRatings: 0,
          averageRating: 0,
          feedback: [],
        },
        categoryBreakdown: [],
      });
    }

    // Update satisfaction metrics
    const totalRatings = performance.customerSatisfaction.totalRatings + 1;
    const newAverage =
      (performance.customerSatisfaction.averageRating *
        performance.customerSatisfaction.totalRatings +
        rating) /
      totalRatings;

    performance.customerSatisfaction.totalRatings = totalRatings;
    performance.customerSatisfaction.averageRating = Math.round(newAverage * 10) / 10;

    if (feedback) {
      performance.customerSatisfaction.feedback.push({
        rating,
        comment: feedback,
        date: new Date(),
      });
    }

    await performance.save();

    return NextResponse.json({
      success: true,
      averageRating: performance.customerSatisfaction.averageRating,
      totalRatings: performance.customerSatisfaction.totalRatings,
    });
  } catch (error) {
    console.error("Error rating staff:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
