import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    authVersion: { type: Number, default: 0 },
    bio: { type: String, trim: true, maxlength: 300, default: "" },
    avatarUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
