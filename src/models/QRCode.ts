import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQRCode extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  type: "room" | "facility" | "equipment";
  hostel: string;
  block?: string;
  floor?: string;
  room?: string;
  location?: string;
  url?: string;
  facilityName?: string;
  description?: string;
  isActive: boolean;
  scans: {
    user: mongoose.Types.ObjectId;
    timestamp: Date;
    action: "view" | "report";
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const qrCodeSchema = new Schema<IQRCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["room", "facility", "equipment"],
      default: "facility",
    },
    hostel: {
      type: String,
      required: true,
    },
    block: {
      type: String,
    },
    floor: {
      type: String,
    },
    room: {
      type: String,
    },
    location: {
      type: String,
    },
    url: {
      type: String,
    },
    facilityName: {
      type: String,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scans: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      action: {
        type: String,
        enum: ["view", "report"],
      },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
qrCodeSchema.index({ code: 1 });
qrCodeSchema.index({ hostel: 1, block: 1, room: 1 });
qrCodeSchema.index({ type: 1, isActive: 1 });

const QRCode: Model<IQRCode> =
  mongoose.models.QRCode || mongoose.model<IQRCode>("QRCode", qrCodeSchema);

export default QRCode;
