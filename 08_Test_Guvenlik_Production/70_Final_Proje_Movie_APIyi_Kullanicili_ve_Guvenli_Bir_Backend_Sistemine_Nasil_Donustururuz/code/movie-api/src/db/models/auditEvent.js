import mongoose from "mongoose";
const schema = new mongoose.Schema({ action: { type: String, required: true }, actorId: mongoose.Schema.Types.ObjectId, targetId: mongoose.Schema.Types.ObjectId, outcome: String }, { timestamps: true });
export const AuditEvent = mongoose.models.AuditEvent || mongoose.model("AuditEvent", schema);
