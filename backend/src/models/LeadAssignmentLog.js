import mongoose from "mongoose";

const { Schema, model } = mongoose;

const leadAssignmentLogSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "LeadRow",
      required: true,
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    fromAssignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    toAssignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      default: null,
      trim: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

leadAssignmentLogSchema.index({ leadId: 1, assignedAt: -1 });

export const LeadAssignmentLog = model(
  "LeadAssignmentLog",
  leadAssignmentLogSchema
);
