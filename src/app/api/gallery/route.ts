import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { GalleryPost } from "@/models";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, fileName: string) => {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "hostel-gallery",
        resource_type: "image",
        public_id: `${Date.now()}-${fileName}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
          return;
        }
        resolve({ 
          url: result.secure_url, 
          publicId: result.public_id 
        });
      }
    );

    stream.end(buffer);
  });
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const hostel = searchParams.get("hostel");
    const limit = parseInt(searchParams.get("limit") || "100");
    const session = await getServerSession(authOptions);
    const query: Record<string, unknown> = {};

    if (hostel) {
      query.hostel = hostel;
    }

    const posts = await GalleryPost.find(query)
      .populate("uploadedBy", "name avatar hostel role isVerified")
      .populate({ path: "comments.user", select: "name avatar", strictPopulate: false })
      .sort({ uploadDate: -1 })
      .limit(limit)
      .lean();

    const enriched = posts.map((post: any) => {
      const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
      const isLiked = session?.user?.id
        ? post.likes?.some((id: any) => id.toString() === session.user.id)
        : false;

      return {
        ...post,
        likeCount,
        isLiked,
      };
    });

    return NextResponse.json({ posts: enriched });
  } catch (error) {
    console.error("Error fetching gallery posts:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

function getAcademicYear(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    const caption = (formData.get("caption") as string) || "";
    const hostel = (formData.get("hostel") as string) || session.user.hostel || "";
    const files = formData.getAll("files") as File[];

    if (!hostel) {
      return NextResponse.json({ error: "Hostel is required" }, { status: 400 });
    }

    const fileFromSingle = formData.get("file") as File | null;
    const selectedFile = fileFromSingle || files[0];
    if (!selectedFile) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    if (!selectedFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
    }

    const arrayBuffer = await selectedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const upload = await uploadToCloudinary(buffer, selectedFile.name);
    const uploadDate = new Date();
    const academicYear = getAcademicYear(uploadDate);

    const post = await GalleryPost.create({
      caption,
      imageUrl: upload.url,
      publicId: upload.publicId,
      hostel,
      college: session.user.college,
      uploadedBy: session.user.id,
      uploadDate,
      academicYear,
      likes: [],
      comments: [],
    });

    await post.populate("uploadedBy", "name avatar hostel role isVerified");

    return NextResponse.json({
      message: "Gallery post created",
      post,
    });
  } catch (error) {
    console.error("Error creating gallery post:", error);
    return NextResponse.json({ error: "Failed to create gallery post" }, { status: 500 });
  }
}