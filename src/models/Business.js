import mongoose from "mongoose";

const { Schema, model } = mongoose;

const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      required: true,
      default: "BDT",
      uppercase: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["free", "starter", "pro"],
      default: "free",
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true,
    },
    phoneCountry: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.index({ createdBy: 1 });
businessSchema.index({ name: 1 });

export const Business = model("Business", businessSchema);
