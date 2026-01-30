import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  attachments: string[];
  parentComment?: mongoose.Types.ObjectId;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStatusUpdate {
  status: string;
  updatedBy: mongoose.Types.ObjectId;
  remarks?: string;
  timestamp: Date;
}

export interface IIssue extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "emergency";
  urgencyLevel?: "low" | "medium" | "high" | "red";
  urgencyScore?: number;
  status: "reported" | "assigned" | "in_progress" | "resolved" | "rejected";
  reporter: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  hostel: string;
  college?: string;
  block: string;
  floor: string;
  room: string;
  location?: string;
  images: string[];
  videos: string[];
  voiceNote?: string;
  voiceNoteTranscript?: string;
  isPublic: boolean;
  upvotes: mongoose.Types.ObjectId[];
  upvoteCount: number;
  reactions: {
    validate: mongoose.Types.ObjectId[];
    urgent: mongoose.Types.ObjectId[];
  };
  comments: IComment[];
  statusHistory: IStatusUpdate[];
  resolvedAt?: Date;
  resolutionTime?: number;
  resolutionNotes?: string;
  isDuplicate: boolean;
  duplicateOf?: mongoose.Types.ObjectId;
  relatedIssues: mongoose.Types.ObjectId[];
  tags: string[];
  aiPredictedCategory?: string;
  aiConfidenceScore?: number;
  qrCodeScanned: boolean;
  viewCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [{
      type: String,
    }],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const statusUpdateSchema = new Schema<IStatusUpdate>({
  status: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  remarks: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "plumbing",
        "electrical",
        "cleanliness",
        "internet",
        "furniture",
        "structural",
        "security",
        "ac_heating",
        "pest_control",
        "other",
      ],
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "red"],
      default: "medium",
    },
    urgencyScore: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ["reported", "assigned", "in_progress", "resolved", "rejected"],
      default: "reported",
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    hostel: {
      type: String,
      required: [true, "Hostel is required"],
    },
    college: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      required: [true, "Block is required"],
    },
    floor: {
      type: String,
      required: [true, "Floor is required"],
    },
    room: {
      type: String,
      required: [true, "Room is required"],
    },
    location: {
      type: String,
    },
    images: [{
      type: String,
    }],
    videos: [{
      type: String,
    }],
    voiceNote: {
      type: String,
    },
    voiceNoteTranscript: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    upvoteCount: {
      type: Number,
      default: 0,
    },
    reactions: {
      validate: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
      urgent: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
    },
    comments: [commentSchema],
    statusHistory: [statusUpdateSchema],
    resolvedAt: {
      type: Date,
    },
    resolutionTime: {
      type: Number,
    },
    resolutionNotes: {
      type: String,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
    relatedIssues: [{
      type: Schema.Types.ObjectId,
      ref: "Issue",
    }],
    tags: [{
      type: String,
    }],
    aiPredictedCategory: {
      type: String,
    },
    aiConfidenceScore: {
      type: Number,
    },
    qrCodeScanned: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ college: 1 });
issueSchema.index({ hostel: 1, block: 1, floor: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ isPublic: 1, status: 1 });
issueSchema.index({ "$**": "text" }); // Full-text search

// Virtual for comment count
issueSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

// Pre-save middleware
issueSchema.pre("save", function (next) {
  this.upvoteCount = this.upvotes?.length || 0;
  this.lastActivityAt = new Date();

  // Calculate resolution time if resolved
  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
    this.resolutionTime = Math.floor(
      (this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)
    );
  }

  next();
});

const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>("Issue", issueSchema);

export default Issue;
