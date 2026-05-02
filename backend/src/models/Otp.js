import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

export const OTP_TYPES = Object.freeze({
  EMAIL_VERIFICATION: "emailVerification",
  PASSWORD_RESET: "passwordReset",
  INVITATION: "invitation",
  MAGIC_LINK: "magicLink",
});

const otpSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(OTP_TYPES),
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    consumed: {
      type: Boolean,
      default: false,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    context: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ userId: 1, type: 1, consumed: 1 });

otpSchema.statics.generateCode = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

otpSchema.statics.createOtp = async function ({
  userId,
  type,
  ttlMinutes = 15,
  context = null,
}) {
  await this.updateMany({ userId, type, consumed: false }, { consumed: true });

  const code = this.generateCode();
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await this.create({
    userId,
    type,
    codeHash,
    expiresAt,
    consumed: false,
    context,
  });

  return code;
};

otpSchema.statics.verifyOtp = async function ({ userId, type, code }) {
  const otp = await this.findOne({ userId, type, consumed: false }).sort({
    createdAt: -1,
  });

  if (!otp) {
    return false;
  }

  if (new Date() > otp.expiresAt) {
    otp.consumed = true;
    await otp.save();
    return false;
  }

  const isMatch = await bcrypt.compare(code, otp.codeHash);
  otp.attempts += 1;

  if (!isMatch) {
    await otp.save();
    return false;
  }

  otp.consumed = true;
  await otp.save();
  return true;
};

export const Otp = model("Otp", otpSchema);
