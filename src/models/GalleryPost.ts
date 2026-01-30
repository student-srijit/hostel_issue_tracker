import mongoose, { Schema, Document } from "mongoose";

export interface IGalleryPost extends Document {
  _id: mongoose.Types.ObjectId;
  imageUrl: string;
  caption?: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadDate: Date;
  academicYear: string;
  hostel: string;
  college?: string;
  publicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const galleryPostSchema = new Schema<IGalleryPost>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    academicYear: {
      type: String,
      required: true,
    },
    hostel: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String,
    },
  },
  { timestamps: true }
);

const GalleryPost = mongoose.models.GalleryPost || mongoose.model<IGalleryPost>("GalleryPost", galleryPostSchema);

export default GalleryPost;