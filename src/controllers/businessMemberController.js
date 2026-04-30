import { Business, BusinessMember, User } from "../models/index.js";
import {
  sendSuccess,
  sendError,
  sendForbidden,
  sendNotFound,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";

const canManageMembers = (role) => ["owner", "admin"].includes(role);

const resolveFallbackBusinessId = async (userId, currentBusinessId) => {
  const memberships = await BusinessMember.findActiveExcludingBusinessForUser(
    userId,
    currentBusinessId
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

export const listBusinessMembers = asyncHandler(async (req, res) => {
  const { activeRole } = req.user;
  const { businessId } = req;

  if (!canManageMembers(activeRole)) {
    return sendForbidden(res, "Only owners and admins can view members");
  }

  const members = await BusinessMember.find({
    businessId,
    status: "active",
  })
    .populate("userId", "name email activeBusiness")
    .sort({ joinedAt: -1 });

  const formattedMembers = members.map((member) => ({
    id: member._id,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    user: member.userId
      ? {
          id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email,
          activeBusiness: member.userId.activeBusiness,
        }
      : null,
  }));

  return sendSuccess(res, "Business members retrieved successfully", {
    members: formattedMembers,
  });
});

export const removeBusinessMember = asyncHandler(async (req, res) => {
  const { userId: targetUserId } = req.validated.params;
  const { userId: actorUserId, activeRole } = req.user;
  const { businessId } = req;

  if (!canManageMembers(activeRole)) {
    return sendForbidden(res, "Only owners and admins can remove members");
  }

  if (targetUserId === actorUserId) {
    return sendError(res, "You cannot remove yourself from this business", 400);
  }

  const actorMembership = await BusinessMember.findOne({
    businessId,
    userId: actorUserId,
    status: "active",
  });

  if (!actorMembership) {
    return sendForbidden(res, "Access denied to this business");
  }

  const targetMembership = await BusinessMember.findOne({
    businessId,
    userId: targetUserId,
    status: "active",
  });

  if (!targetMembership) {
    return sendNotFound(res, "Active member");
  }

  if (targetMembership.role === "owner" && actorMembership.role !== "owner") {
    return sendForbidden(res, "Only owners can remove business owners");
  }

  if (targetMembership.role === "owner") {
    const activeOwnerCount = await BusinessMember.countDocuments({
      businessId,
      status: "active",
      role: "owner",
    });

    if (activeOwnerCount <= 1) {
      return sendError(
        res,
        "Cannot remove the last owner from this business",
        409
      );
    }
  }

  targetMembership.status = "removed";
  await targetMembership.save();

  const targetUser = await User.findById(targetUserId).select("activeBusiness");
  if (targetUser && targetUser.activeBusiness?.toString() === businessId) {
    const fallbackBusinessId = await resolveFallbackBusinessId(
      targetUserId,
      businessId
    );
    targetUser.activeBusiness = fallbackBusinessId;
    await targetUser.save();
  }

  logger.info("Business member removed successfully", {
    businessId,
    removedUserId: targetUserId,
    removedBy: actorUserId,
  });

  return sendSuccess(res, "Business member removed successfully");
});
