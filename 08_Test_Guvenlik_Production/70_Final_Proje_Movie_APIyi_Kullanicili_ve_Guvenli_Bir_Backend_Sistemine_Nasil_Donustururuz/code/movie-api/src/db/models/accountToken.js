import mongoose from "mongoose";

const accountTokenSchema = new mongoose.Schema(
  {
    newEmail: String,
    emailBeforeChange: String,
    authVersionAtIssue: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email_verify", "password_reset", "email_change"],
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const AccountToken =
  mongoose.models.AccountToken ||
  mongoose.model("AccountToken", accountTokenSchema);
