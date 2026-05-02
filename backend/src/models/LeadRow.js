import mongoose from "mongoose";

const { Schema, model } = mongoose;

const leadRowSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    contactListId: {
      type: Schema.Types.ObjectId,
      ref: "ContactList",
      required: true,
      index: true,
    },
    values: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    normalized: {
      email: {
        type: String,
        default: null,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        default: null,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["new", "open", "won", "lost"],
      default: "new",
      index: true,
    },
    assignmentState: {
      type: String,
      enum: ["unassigned", "assigned", "reassigned"],
      default: "unassigned",
      index: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: ["manual", "webhook", "csv", "gsheet"],
      default: "manual",
      index: true,
    },
    sourceRef: {
      type: String,
      default: null,
      trim: true,
    },
    importBatchId: {
      type: String,
      default: null,
      index: true,
    },
    dedupeHash: {
      type: String,
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

leadRowSchema.index({ businessId: 1, contactListId: 1, createdAt: -1 });
leadRowSchema.index({ businessId: 1, contactListId: 1, dedupeHash: 1 });

leadRowSchema.statics.findActiveById = function (id, businessId) {
  return this.findOne({ _id: id, businessId });
};

export const LeadRow = model("LeadRow", leadRowSchema);
