import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedByToken: { type: String, default: null },
  userAgent: String
}, { timestamps: true });

refreshTokenSchema.virtual("isExpired").get(function() {
  return Date.now() >= this.expiresAt;
});

refreshTokenSchema.virtual("isActive").get(function() {
  return !this.revoked && !this.isExpired;
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
