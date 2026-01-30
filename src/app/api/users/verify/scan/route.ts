import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { spawn } from "child_process";
import { mkdir, writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { existsSync } from "fs";

const normalizeCollege = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(college|university|institute|of|the|campus)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isCollegeMatch = (a?: string, b?: string) => {
  if (!a || !b) return false;
  const aa = normalizeCollege(a);
  const bb = normalizeCollege(b);
  if (!aa || !bb) return false;
  return aa.includes(bb) || bb.includes(aa);
};

const hasCollegeEvidence = (rawText: string | undefined, college: string | undefined) => {
  if (!rawText || !college) return false;
  const normalizedText = normalizeCollege(rawText);
  const tokens = normalizeCollege(college)
    .split(" ")
    .filter((token) => token.length > 2);
  if (!tokens.length) return false;
  const hits = tokens.filter((token) => normalizedText.includes(token));
  return hits.length >= Math.min(2, tokens.length) || (tokens.length === 1 && hits.length === 1);
};

const hasAcademicSignals = (rawText: string | undefined) => {
  if (!rawText) return false;
  return /(branch|department|semester|student\s*id|reg\s*no|registration|usn|roll\s*no|acd\s*yr|academic\s*year)/i.test(rawText);
};

const isCollegeLowQuality = (value: string | undefined) => {
  if (!value) return true;
  const cleaned = value.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return true;
  const hasKeyword = /(college|university|institute|institutions|engineering|school|campus)/i.test(cleaned);
  const wordCount = cleaned.split(" ").filter(Boolean).length;
  if (!hasKeyword && (wordCount < 2 || cleaned.length < 12)) return true;
  return false;
};

const runPythonScan = async (imagePath: string) => {
  const venvRoot = process.env.VIRTUAL_ENV || path.join(process.cwd(), ".venv");
  const venvPython = path.join(venvRoot, "Scripts", "python.exe");
  const fallbackPython = "python";
  const candidates = [process.env.PYTHON_PATH, venvPython, fallbackPython].filter(Boolean) as string[];
  const pythonPath = candidates.find((candidate) => candidate === fallbackPython || existsSync(candidate)) || fallbackPython;
  const scriptPath = path.join(process.cwd(), "scripts", "id_card_scanner.py");

  const result = await new Promise<string>((resolve, reject) => {
    const child = spawn(pythonPath, [scriptPath, "--image", imagePath, "--json"], {
      env: process.env,
    });

    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(errorOutput || "Failed to run OCR"));
      } else {
        resolve(output.trim());
      }
    });
  });

  return JSON.parse(result);
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Upload a clear ID card image." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = path.join(tmpdir(), "hostel-verify");
    await mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `${Date.now()}-${file.name}`);
    await writeFile(filePath, buffer);

    let scanResult: any = null;
    try {
      scanResult = await runPythonScan(filePath);
    } finally {
      await unlink(filePath).catch(() => undefined);
    }

    const scannedCollege = scanResult?.college || "";
    if (scanResult?.doc_type !== "college_id") {
      return NextResponse.json(
        {
          error: "Uploaded document is not a college ID card.",
          scanResult,
        },
        { status: 400 }
      );
    }
    const collegeMatches = isCollegeMatch(scannedCollege, session.user.college);
    const collegeEvidence = hasCollegeEvidence(scanResult?.raw_text, session.user.college);
    const academicSignals = hasAcademicSignals(scanResult?.raw_text);
    const lowQualityCollege = isCollegeLowQuality(scannedCollege);

    if ((lowQualityCollege || !scannedCollege) && scanResult?.doc_type === "college_id" && (collegeEvidence || academicSignals)) {
      scanResult.college = session.user.college;
    }

    if (!isCollegeMatch(scanResult?.college || "", session.user.college)) {
      return NextResponse.json(
        {
          error: "College name on ID card does not match your signup college.",
          scanResult,
        },
        { status: 400 }
      );
    }

    if (!scanResult?.name || !scanResult?.dob || !scanResult?.phone || !scanResult?.student_id) {
      return NextResponse.json(
        {
          error: "Missing required fields (name, DOB, phone, student ID). Use a clearer image.",
          scanResult,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await User.findOne({
      studentId: scanResult.student_id,
      _id: { $ne: session.user.id },
    }).select("_id");

    if (existing) {
      return NextResponse.json(
        { error: "This college ID is already linked to another account.", scanResult },
        { status: 409 }
      );
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { studentId: scanResult.student_id, isVerified: true },
      { new: true }
    ).select("name email studentId isVerified role college");

    return NextResponse.json({
      user: updated,
      scanResult,
    });
  } catch (error) {
    console.error("Error scanning ID card:", error);
    return NextResponse.json(
      { error: "Failed to scan ID card. Ensure Python OCR is installed." },
      { status: 500 }
    );
  }
}
