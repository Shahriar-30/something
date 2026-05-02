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
    location: {
      type: {
        street: {
          type: String,
          default: null,
          trim: true,
        },
        city: {
          type: String,
          default: null,
          trim: true,
        },
        state: {
          type: String,
          default: null,
          trim: true,
        },
        zip: {
          type: String,
          default: null,
          trim: true,
        },
        country: {
          type: String,
          default: null,
          trim: true,
        },
      },
      default: null,
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

businessSchema.index({ createdBy: 1 });
businessSchema.index({ name: 1 });
businessSchema.index({ isDeleted: 1, name: 1 });

businessSchema.statics.findActiveById = function (businessId) {
  return this.findOne({ _id: businessId, isDeleted: false });
};

businessSchema.statics.softDelete = function (businessId, deletedBy) {
  return this.findOneAndUpdate(
    { _id: businessId, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
    },
    { new: true }
  );
};

export const Business = model("Business", businessSchema);
