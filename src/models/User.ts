import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: "student" | "management" | "maintenance";
  avatar?: string;
  phone?: string;
  hostel?: string;
  block?: string;
  floor?: string;
  room?: string;
  studentId?: string;
  college?: string;
  employeeId?: string;
  department?: string;
  specialization?: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  karmaScore: number;
  badges: string[];
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: ["student", "management", "maintenance"],
      default: "student",
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    hostel: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    college: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    department: {
      type: String,
    },
    specialization: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    karmaScore: {
      type: Number,
      default: 0,
    },
    badges: [{
      type: String,
    }],
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes (email already indexed via unique: true in schema)
userSchema.index({ role: 1 });
userSchema.index({ hostel: 1, block: 1 });
userSchema.index({ college: 1 });
userSchema.index({ isActive: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
