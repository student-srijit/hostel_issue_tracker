import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaffPerformance extends Document {
  _id: mongoose.Types.ObjectId;
  staff: mongoose.Types.ObjectId;
  period: {
    month: number;
    year: number;
  };
  metrics: {
    totalAssigned: number;
    totalResolved: number;
    totalRejected: number;
    avgResolutionTime: number;
    fastestResolution: number;
    slowestResolution: number;
    emergencyHandled: number;
    rating: number;
    ratingCount: number;
  };
  badges: string[];
  rank: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const staffPerformanceSchema = new Schema<IStaffPerformance>(
  {
    staff: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    metrics: {
      totalAssigned: { type: Number, default: 0 },
      totalResolved: { type: Number, default: 0 },
      totalRejected: { type: Number, default: 0 },
      avgResolutionTime: { type: Number, default: 0 },
      fastestResolution: { type: Number, default: 0 },
      slowestResolution: { type: Number, default: 0 },
      emergencyHandled: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
    },
    badges: [{
      type: String,
    }],
    rank: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
staffPerformanceSchema.index({ staff: 1, "period.month": 1, "period.year": 1 }, { unique: true });
staffPerformanceSchema.index({ points: -1 });
staffPerformanceSchema.index({ "period.year": 1, "period.month": 1, rank: 1 });

const StaffPerformance: Model<IStaffPerformance> =
  mongoose.models.StaffPerformance || mongoose.model<IStaffPerformance>("StaffPerformance", staffPerformanceSchema);

export default StaffPerformance;
