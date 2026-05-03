import mongoose from "mongoose";

const { Schema, model } = mongoose;

const businessMemberAuditLogSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["role_update", "member_removed", "invitation_sent", "invitation_accepted"],
      required: true,
    },
    previousValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: null,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

businessMemberAuditLogSchema.index({ businessId: 1, timestamp: -1 });

export const BusinessMemberAuditLog = model(
  "BusinessMemberAuditLog",
  businessMemberAuditLogSchema
);
