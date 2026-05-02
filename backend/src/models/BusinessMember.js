import mongoose from "mongoose";

const { Schema, model } = mongoose;

const businessMemberSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["owner", "admin", "staff", "viewer"],
      default: "viewer",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "pending", "removed"],
      default: "active",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

businessMemberSchema.index({ businessId: 1, userId: 1 }, { unique: true });

businessMemberSchema.statics.findActiveForBusiness = function (
  businessId,
  userId
) {
  return this.findOne({ businessId, userId, status: "active" });
};

businessMemberSchema.statics.findActiveExcludingBusinessForUser = function (
  userId,
  businessId
) {
  return this.find({
    userId,
    businessId: { $ne: businessId },
    status: "active",
  }).sort({ joinedAt: -1 });
};

export const BusinessMember = model("BusinessMember", businessMemberSchema);
