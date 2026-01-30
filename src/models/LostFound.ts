import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILostFoundItem extends Document {
  _id: mongoose.Types.ObjectId;
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  images: string[];
  location: {
    hostel: string;
    block: string;
    floor: string;
    specificLocation: string;
  };
  date: Date;
  reporter: mongoose.Types.ObjectId;
  college?: string;
  contactMethod: "app" | "phone" | "email";
  contactDetails?: string;
  views: number;
  status: "active" | "claimed" | "returned" | "expired";
  claimedBy?: mongoose.Types.ObjectId;
  claimedAt?: Date;
  claims: {
    claimant: mongoose.Types.ObjectId;
    message: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
  }[];
  matchedWith?: mongoose.Types.ObjectId;
  matchScore?: number;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const claimSchema = new Schema({
  claimant: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const lostFoundSchema = new Schema<ILostFoundItem>(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "electronics",
        "documents",
        "clothing",
        "accessories",
        "keys",
        "wallet",
        "bag",
        "books",
        "sports",
        "other",
      ],
    },
    images: [{
      type: String,
    }],
    location: {
      hostel: { type: String, required: true },
      block: { type: String, required: true },
      floor: { type: String },
      specificLocation: { type: String },
    },
    date: {
      type: Date,
      required: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: String,
      trim: true,
      index: true,
    },
    contactMethod: {
      type: String,
      enum: ["app", "phone", "email"],
      default: "app",
    },
    contactDetails: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "claimed", "returned", "expired"],
      default: "active",
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    claimedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    claims: [claimSchema],
    matchedWith: {
      type: Schema.Types.ObjectId,
      ref: "LostFound",
    },
    matchScore: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lostFoundSchema.index({ type: 1, status: 1, createdAt: -1 });
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ reporter: 1 });
lostFoundSchema.index({ college: 1 });
lostFoundSchema.index({ "location.hostel": 1, "location.block": 1 });
lostFoundSchema.index({ "$**": "text" });

const LostFound: Model<ILostFoundItem> =
  mongoose.models.LostFound || mongoose.model<ILostFoundItem>("LostFound", lostFoundSchema);

export default LostFound;
