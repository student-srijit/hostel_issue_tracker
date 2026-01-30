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
  likes: mongoose.Types.ObjectId[];
  comments: Array<{
    user: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
  }>;
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
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
          maxlength: 500,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const existingModel = mongoose.models.GalleryPost as mongoose.Model<IGalleryPost> | undefined;

if (existingModel) {
  const existingSchema = existingModel.schema;
  if (!existingSchema.path("likes")) {
    existingSchema.add({
      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    });
  }
  if (!existingSchema.path("comments")) {
    existingSchema.add({
      comments: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          comment: {
            type: String,
            required: true,
            maxlength: 500,
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    });
  }
}

const GalleryPost = existingModel || mongoose.model<IGalleryPost>("GalleryPost", galleryPostSchema);

export default GalleryPost;