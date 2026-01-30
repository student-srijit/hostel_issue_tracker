import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaffPerformance extends Document {
  _id: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  period: Date;
  tasksAssigned: number;
  tasksCompleted: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfaction: {
    totalRatings: number;
    averageRating: number;
    feedback: Array<{
      rating: number;
      comment?: string;
      date: Date;
    }>;
  };
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageResolutionTime?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const staffPerformanceSchema = new Schema<IStaffPerformance>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: Date,
      required: true,
    },
    tasksAssigned: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    averageResolutionTime: { type: Number, default: 0 },
    customerSatisfaction: {
      totalRatings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      feedback: [
        {
          rating: { type: Number, required: true },
          comment: { type: String },
          date: { type: Date, default: Date.now },
        },
      ],
    },
    categoryBreakdown: [
      {
        category: { type: String, required: true },
        count: { type: Number, default: 0 },
        averageResolutionTime: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
staffPerformanceSchema.index({ staffId: 1, period: 1 }, { unique: true });
staffPerformanceSchema.index({ period: -1 });

const StaffPerformance: Model<IStaffPerformance> =
  mongoose.models.StaffPerformance || mongoose.model<IStaffPerformance>("StaffPerformance", staffPerformanceSchema);

export default StaffPerformance;
