import mongoose from "mongoose";

const { Schema, model } = mongoose;

const fieldSchemaItemSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "email", "phone", "address", "number", "date", "select"],
      default: "text",
    },
    required: {
      type: Boolean,
      default: false,
    },
    unique: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const assignmentConfigSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ["queue", "auto"],
      default: "queue",
    },
    strategy: {
      type: String,
      enum: ["round_robin", "least_loaded"],
      default: "round_robin",
    },
    assigneePool: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roundRobinCursor: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const contactListSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fieldSchema: {
      type: [fieldSchemaItemSchema],
      default: [],
    },
    assignmentConfig: {
      type: assignmentConfigSchema,
      default: () => ({
        mode: "queue",
        strategy: "round_robin",
        assigneePool: [],
        roundRobinCursor: 0,
      }),
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contactListSchema.index({ businessId: 1, title: 1, isDeleted: 1 });

contactListSchema.statics.findActiveById = function (id, businessId) {
  return this.findOne({ _id: id, businessId, isDeleted: false });
};

export const ContactList = model("ContactList", contactListSchema);
