import { Business, BusinessMember, User } from "../models/index.js";
import {
  sendSuccess,
  sendForbidden,
  sendNotFound,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

const canUpdateBusiness = (role) => ["owner", "admin"].includes(role);
const canDeleteBusiness = (role) => role === "owner";
const { JWT_SECRET, JWT_EXPIRES_IN } = env;

const generateToken = (userId, activeBusinessId, activeRole) => {
  return jwt.sign(
    {
      userId,
      activeBusinessId,
      activeRole,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const getUserBusinesses = async (userId) => {
  const memberships = await BusinessMember.find({
    userId,
    status: "active",
  })
    .select("businessId role")
    .lean();

  const businessIds = memberships.map((membership) => membership.businessId);
  const businesses = await Business.find({
    _id: { $in: businessIds },
    isDeleted: false,
  })
    .select("name")
    .lean();

  const businessMap = new Map(
    businesses.map((business) => [business._id.toString(), business])
  );

  return memberships
    .map((membership) => {
      const business = businessMap.get(membership.businessId.toString());
      if (!business) {
        return null;
      }
      return {
        id: business._id,
        name: business.name,
        role: membership.role,
      };
    })
    .filter(Boolean);
};

const resolveFallbackBusinessId = async (userId, deletedBusinessId) => {
  const memberships = await BusinessMember.findActiveExcludingBusinessForUser(
    userId,
    deletedBusinessId
  )
    .select("businessId")
    .lean();

  for (const membership of memberships) {
    const activeBusiness = await Business.findActiveById(membership.businessId);
    if (activeBusiness) {
      return activeBusiness._id;
    }
  }

  return null;
};

export const updateBusiness = asyncHandler(async (req, res) => {
  const { id: businessId } = req.validated.params;
  const { userId } = req.user;
  const payload = req.validated.body;

  const membership = await BusinessMember.findActiveForBusiness(businessId, userId);
  if (!membership || !canUpdateBusiness(membership.role)) {
    return sendForbidden(
      res,
      "Only owners and admins can update this business"
    );
  }

  const business = await Business.findActiveById(businessId);
  if (!business) {
    return sendNotFound(res, "Business not found");
  }

  const updateData = {};
  const allowedFields = [
    "name",
    "logoUrl",
    "currency",
    "location",
    "phoneNumber",
    "phoneCountry",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updateData[field] = payload[field];
    }
  }

  Object.assign(business, updateData);
  await business.save();

  logger.info("Business updated successfully", {
    businessId,
    updatedBy: userId,
    role: membership.role,
  });

  return sendSuccess(res, "Business updated successfully", {
    business: {
      id: business._id,
      name: business.name,
      logoUrl: business.logoUrl,
      currency: business.currency,
      location: business.location,
      phoneNumber: business.phoneNumber,
      phoneCountry: business.phoneCountry,
      updatedAt: business.updatedAt,
    },
  });
});

export const createBusiness = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const payload = req.validated.body;

  const business = new Business({
    createdBy: userId,
    name: payload.name,
    logoUrl: payload.logoUrl ?? null,
    currency: payload.currency || "BDT",
    location: payload.location ?? null,
    phoneNumber: payload.phoneNumber ?? null,
    phoneCountry: payload.phoneCountry ?? null,
  });
  await business.save();

  const membership = new BusinessMember({
    businessId: business._id,
    userId,
    role: "owner",
    status: "active",
  });
  await membership.save();

  await User.findByIdAndUpdate(userId, { activeBusiness: business._id });

  const businesses = await getUserBusinesses(userId);
  const activeBusiness = businesses.find(
    (b) => b.id.toString() === business._id.toString()
  );

  const token = generateToken(userId, business._id, "owner");

  logger.info("User created a new business", {
    userId,
    businessId: business._id,
  });

  return sendSuccess(res, "Business created successfully", {
    token,
    activeBusiness,
    businesses,
  });
});

export const getBusinessById = asyncHandler(async (req, res) => {
  const { id: businessId } = req.validated.params;
  const { userId } = req.user;

  const membership = await BusinessMember.findActiveForBusiness(businessId, userId);
  if (!membership) {
    return sendForbidden(res, "Access denied to this business");
  }

  const business = await Business.findActiveById(businessId).select(
    "name logoUrl currency location phoneNumber phoneCountry createdAt updatedAt"
  );
  if (!business) {
    return sendNotFound(res, "Business not found");
  }

  return sendSuccess(res, "Business retrieved successfully", {
    business: {
      id: business._id,
      name: business.name,
      logoUrl: business.logoUrl,
      currency: business.currency,
      location: business.location,
      phoneNumber: business.phoneNumber,
      phoneCountry: business.phoneCountry,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      role: membership.role,
    },
  });
});

export const getMyBusinesses = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const businesses = await getUserBusinesses(userId);

  return sendSuccess(res, "Businesses retrieved successfully", {
    businesses,
  });
});

export const softDeleteBusiness = asyncHandler(async (req, res) => {
  const { id: businessId } = req.validated.params;
  const { userId } = req.user;

  const membership = await BusinessMember.findActiveForBusiness(businessId, userId);
  if (!membership || !canDeleteBusiness(membership.role)) {
    return sendForbidden(res, "Only owners can delete this business");
  }

  const deletedBusiness = await Business.softDelete(businessId, userId);
  if (!deletedBusiness) {
    return sendNotFound(res, "Business not found");
  }

  const memberships = await BusinessMember.find({
    businessId,
    status: "active",
  }).select("userId");

  await BusinessMember.updateMany(
    { businessId, status: "active" },
    {
      $set: {
        status: "removed",
      },
    }
  );

  const affectedUserIds = [...new Set(memberships.map((m) => m.userId.toString()))];

  const usersWithDeletedActiveBusiness = await User.find({
    _id: { $in: affectedUserIds },
    activeBusiness: businessId,
  }).select("_id");

  await Promise.all(
    usersWithDeletedActiveBusiness.map(async (user) => {
      const fallbackBusinessId = await resolveFallbackBusinessId(
        user._id,
        businessId
      );

      await User.findByIdAndUpdate(user._id, {
        activeBusiness: fallbackBusinessId,
      });
    })
  );

  logger.info("Business soft-deleted successfully", {
    businessId,
    deletedBy: userId,
    affectedMembers: affectedUserIds.length,
  });

  return sendSuccess(res, "Business deleted successfully");
});
