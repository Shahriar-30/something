import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

const { Schema, model } = mongoose;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

const invitationSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["owner", "admin", "staff", "viewer"],
      default: "viewer",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    otpHash: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    expiredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expiredAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

invitationSchema.index({ businessId: 1, email: 1, status: 1 });

invitationSchema.methods.setOtp = async function (otp) {
  this.otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  return otp;
};

invitationSchema.methods.verifyOtp = async function (otp) {
  if (!this.otpHash) {
    return false;
  }

  return bcrypt.compare(otp, this.otpHash);
};

invitationSchema.methods.isExpired = function () {
  return this.status === "expired" || this.status === "revoked";
};

invitationSchema.methods.getInviteLink = function () {
  const frontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
  return `${frontendUrl}/auth/invite/accept/${this.token}`;
};

export const Invitation = model("Invitation", invitationSchema);
