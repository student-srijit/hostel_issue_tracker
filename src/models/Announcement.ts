import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "info" | "urgent" | "scheduled" | "maintenance" | "event";
  priority?: "low" | "medium" | "high" | "urgent";
  author: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  college?: string;
  hostel?: string;
  targetAudience: {
    type: "all" | "hostel" | "block" | "role";
    values: string[];
  };
  attachments: string[];
  isPublished: boolean;
  isPinned: boolean;
  scheduledAt?: Date;
  expiresAt?: Date;
  views: number;
  likes: number;
  reactions: {
    likes: mongoose.Types.ObjectId[];
    helpful: mongoose.Types.ObjectId[];
  };
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [10000, "Content cannot exceed 10000 characters"],
    },
    type: {
      type: String,
      enum: ["info", "urgent", "scheduled", "maintenance", "event"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    college: {
      type: String,
      index: true,
    },
    hostel: {
      type: String,
      default: "all",
    },
    targetAudience: {
      type: {
        type: String,
        enum: ["all", "hostel", "block", "role"],
        default: "all",
      },
      values: [{
        type: String,
      }],
    },
    attachments: [{
      type: String,
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    reactions: {
      likes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
      helpful: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
announcementSchema.index({ isPublished: 1, createdAt: -1 });
announcementSchema.index({ type: 1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ "targetAudience.type": 1, "targetAudience.values": 1 });

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", announcementSchema);

export default Announcement;
