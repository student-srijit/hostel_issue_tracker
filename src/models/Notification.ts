import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: "issue_update" | "assignment" | "comment" | "announcement" | "lost_found" | "badge" | "system";
  title: string;
  message: string;
  data?: {
    issueId?: mongoose.Types.ObjectId;
    announcementId?: mongoose.Types.ObjectId;
    lostFoundId?: mongoose.Types.ObjectId;
    link?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["issue_update", "assignment", "comment", "announcement", "lost_found", "badge", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      issueId: {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
      announcementId: {
        type: Schema.Types.ObjectId,
        ref: "Announcement",
      },
      lostFoundId: {
        type: Schema.Types.ObjectId,
        ref: "LostFound",
      },
      link: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
