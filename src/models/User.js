import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    activeBusiness: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.compareRefreshToken = async function (refreshToken) {
  if (!this.refreshTokenHash) {
    return false;
  }

  return bcrypt.compare(refreshToken, this.refreshTokenHash);
};

userSchema.methods.setRefreshToken = async function (refreshToken) {
  this.refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

export const User = model("User", userSchema);
