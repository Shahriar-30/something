import {
  Business,
  BusinessMember,
  User,
  BusinessMemberAuditLog,
} from "../models/index.js";
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!canManageMembers(activeRole)) {
    return sendForbidden(res, "Only owners and admins can view members");
  }

  const query = {
    businessId,
    status: "active",
  };

  const [members, total] = await Promise.all([
    BusinessMember.find(query)
      .populate("userId", "name email activeBusiness")
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit),
    BusinessMember.countDocuments(query),
  ]);

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
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
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

  // Log removal
  await BusinessMemberAuditLog.create({
    businessId,
    targetUserId,
    actorUserId,
    action: "member_removed",
    previousValue: { role: targetMembership.role },
  });

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

export const updateBusinessMemberRole = asyncHandler(async (req, res) => {
  const { userId: targetUserId } = req.validated.params;
  const { role: newRole } = req.validated.body;
  const { userId: actorUserId, activeRole } = req.user;
  const { businessId } = req;

  if (!canManageMembers(activeRole)) {
    return sendForbidden(res, "Only owners and admins can update roles");
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

  // Permission rules
  const isOwner = actorMembership.role === "owner";
  const isAdmin = actorMembership.role === "admin";

  if (isAdmin) {
    // 1. Admin cannot modify an Owner's role
    if (targetMembership.role === "owner") {
      return sendForbidden(res, "Administrators cannot modify an Owner's role");
    }

    // 2. Admin cannot modify another Administrator's role
    if (targetMembership.role === "admin") {
      return sendForbidden(
        res,
        "Administrators cannot modify other Administrator roles"
      );
    }

    // 3. Admin can only set roles to 'staff' or 'viewer'
    if (!["staff", "viewer"].includes(newRole)) {
      return sendForbidden(
        res,
        "Administrators can only assign Staff or Viewer roles"
      );
    }
  }

  // 4. Owners have unrestricted privileges (no additional checks needed here)

  // 5. Safety rule: Cannot demote the last owner
  if (targetMembership.role === "owner" && newRole !== "owner") {
    const activeOwnerCount = await BusinessMember.countDocuments({
      businessId,
      status: "active",
      role: "owner",
    });

    if (activeOwnerCount <= 1) {
      return sendError(
        res,
        "Cannot demote the last owner of this business",
        409
      );
    }
  }

  const previousRole = targetMembership.role;
  targetMembership.role = newRole;
  await targetMembership.save();

  // Log role update
  await BusinessMemberAuditLog.create({
    businessId,
    targetUserId,
    actorUserId,
    action: "role_update",
    previousValue: { role: previousRole },
    newValue: { role: newRole },
  });

  logger.info("Business member role updated successfully", {
    businessId,
    targetUserId,
    actorUserId,
    previousRole,
    newRole,
  });

  return sendSuccess(res, "Member role updated successfully", {
    member: {
      id: targetMembership._id,
      userId: targetUserId,
      role: newRole,
    },
  });
});
