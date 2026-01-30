import { NextRequest, NextResponse } from "next/server";
import { predictCategory, generateIssueTitle } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { description, action } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (action === "predict") {
      const prediction = await predictCategory(description);
      return NextResponse.json(prediction);
    }

    if (action === "generateTitle") {
      const title = await generateIssueTitle(description);
      return NextResponse.json({ title });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
