import crypto from "crypto";
import { Business, BusinessMember, Invitation, User } from "../models/index.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendForbidden,
  sendNotFound,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";
import { emailService } from "../services/emailService.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/**
 * Check if user has permission to manage invitations for a business
 */
const canManageInvitations = (userRole) => {
  return ["owner", "admin"].includes(userRole);
};

/**
 * Send invitation to join business
 */
export const sendInvitation = asyncHandler(async (req, res) => {
  const { email, role } = req.validated.body;
  const { activeBusinessId, activeRole, userId } = req.user;
  const normalizedEmail = email.toLowerCase().trim();

  // Check permissions
  if (!canManageInvitations(activeRole)) {
    return sendForbidden(res, "Only owners and admins can send invitations");
  }

  // Validate role
  const validRoles = ["owner", "admin", "staff", "viewer"];
  if (!validRoles.includes(role)) {
    return sendValidationError(
      res,
      "Invalid role. Must be owner, admin, staff, or viewer"
    );
  }

  // Check if business exists
  const business = await Business.findActiveById(activeBusinessId);
  if (!business) {
    return sendNotFound(res, "Business not found");
  }

  // Check if user is already a member
  const existingUser = await User.findByEmail(normalizedEmail);
  const existingMember = existingUser
    ? await BusinessMember.findOne({
        businessId: activeBusinessId,
        userId: existingUser._id,
      })
    : null;

  if (existingMember && existingMember.status === "active") {
    return sendError(res, "User is already a member of this business", 409);
  }

  // Check for existing pending invitation
  const existingInvitation = await Invitation.findOne({
    businessId: activeBusinessId,
    email: normalizedEmail,
    status: "pending",
  });

  if (existingInvitation) {
    return sendError(
      res,
      "An invitation is already pending for this email",
      409
    );
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const invitation = new Invitation({
    businessId: activeBusinessId,
    invitedBy: userId,
    email: normalizedEmail,
    role,
  });

  await invitation.setOtp(otp);

  // Generate invite link
  const inviteLink = invitation.getInviteLink(BASE_URL);
  const inviter = await User.findById(userId);

  // Send email using EmailService
  try {
    await emailService.sendInvitation({
      to: email,
      businessName: business.name,
      role,
      inviterName: inviter?.name || "A team member",
      inviteLink,
      otp,
    });

    await invitation.save();

    logger.info("Invitation sent successfully", {
      businessId: activeBusinessId,
      invitedBy: userId,
      email,
      role,
      invitationId: invitation._id,
    });

    return sendSuccess(res, "Invitation sent successfully", {
      invitationId: invitation._id,
      email: normalizedEmail,
      role,
      sentAt: invitation.sentAt,
    });
  } catch (emailError) {
    logger.error("Failed to send invitation email", {
      error: emailError.message,
      businessId: activeBusinessId,
      email,
    });
    return sendError(res, "Failed to send invitation email", 500);
  }
});

/**
 * Get invitation details by token for prefilled acceptance form
 */
export const getInvitationDetailsByToken = asyncHandler(async (req, res) => {
  const { token } = req.validated.params;

  const invitation = await Invitation.findOne({ token, status: "pending" })
    .populate("businessId", "name isDeleted")
    .populate("invitedBy", "name");

  if (!invitation) {
    return sendNotFound(res, "Invalid or expired invitation");
  }

  if (!invitation.businessId || invitation.businessId.isDeleted) {
    return sendNotFound(res, "Business not found");
  }

  if (invitation.isExpired()) {
    return sendError(res, "This invitation has been expired", 410);
  }

  return sendSuccess(res, "Invitation details retrieved successfully", {
    invitation: {
      token: invitation.token,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      business: {
        id: invitation.businessId._id,
        name: invitation.businessId.name,
      },
      invitedBy: invitation.invitedBy?.name || null,
      sentAt: invitation.sentAt,
    },
  });
});

/**
 * Accept invitation
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.validated.params;
  const { otp, name, email, role, password } = req.validated.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Find invitation
  const invitation = await Invitation.findOne({ token, status: "pending" })
    .populate("businessId", "name isDeleted")
    .populate("invitedBy", "name");

  if (!invitation) {
    return sendNotFound(res, "Invalid or expired invitation");
  }

  if (!invitation.businessId) {
    return sendNotFound(res, "Business not found");
  }

  if (invitation.businessId.isDeleted) {
    return sendError(res, "This invitation is no longer valid", 410);
  }

  // Check if invitation is expired
  if (invitation.isExpired()) {
    return sendError(res, "This invitation has been expired", 410);
  }

  // Verify OTP
  const isValidOtp = await invitation.verifyOtp(otp);
  if (!isValidOtp) {
    return sendValidationError(res, "Invalid verification code");
  }

  if (invitation.email !== normalizedEmail) {
    return sendValidationError(
      res,
      "Provided email does not match the invited email"
    );
  }

  if (invitation.role !== role) {
    return sendValidationError(
      res,
      "Provided role does not match the invited role"
    );
  }

  // Check if user already exists
  let user = await User.findByEmail(invitation.email);

  if (user) {
    // Check if user is already a member
    const existingMembership = await BusinessMember.findOne({
      businessId: invitation.businessId._id,
      userId: user._id,
    });

    if (existingMembership && existingMembership.status === "active") {
      return sendError(res, "You are already a member of this business", 409);
    }
  } else {
    // Create new user from invitation acceptance form.
    user = new User({
      name: name.trim(),
      email: invitation.email,
    });

    await user.setPassword(password);
    await user.save();
  }

  // Create business membership
  const membership = new BusinessMember({
    businessId: invitation.businessId._id,
    userId: user._id,
    role: invitation.role,
    invitedBy: invitation.invitedBy._id,
  });
  await membership.save();

  // Update invitation status
  invitation.status = "accepted";
  invitation.acceptedAt = new Date();
  await invitation.save();

  // Set active business for new users
  if (!user.activeBusiness) {
    user.activeBusiness = invitation.businessId._id;
    await user.save();
  }

  logger.info("Invitation accepted successfully", {
    invitationId: invitation._id,
    userId: user._id,
    businessId: invitation.businessId._id,
    role: invitation.role,
  });

  return sendSuccess(res, "Invitation accepted successfully", {
    business: {
      id: invitation.businessId._id,
      name: invitation.businessId.name,
    },
    role: invitation.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * Get business invitations (for owners/admins)
 */
export const getInvitations = asyncHandler(async (req, res) => {
  const { activeRole } = req.user;
  const { businessId } = req;

  if (!canManageInvitations(activeRole)) {
    return sendForbidden(res, "Only owners and admins can view invitations");
  }

  const invitations = await Invitation.find({
    businessId,
  })
    .populate("invitedBy", "name")
    .sort({ sentAt: -1 });

  const formattedInvitations = invitations.map((inv) => ({
    id: inv._id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    sentAt: inv.sentAt,
    invitedBy: inv.invitedBy?.name,
    expiredBy: inv.expiredBy,
    expiredAt: inv.expiredAt,
  }));

  return sendSuccess(res, "Invitations retrieved successfully", {
    invitations: formattedInvitations,
  });
});

/**
 * Expire invitation manually (for owners/admins)
 */
export const expireInvitation = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { activeRole, userId } = req.user;
  const { businessId } = req;

  if (!canManageInvitations(activeRole)) {
    return sendForbidden(res, "Only owners and admins can expire invitations");
  }

  const invitation = await Invitation.findOne({
    _id: id,
    businessId,
    status: "pending",
  });

  if (!invitation) {
    return sendNotFound(res, "Invitation not found or already processed");
  }

  invitation.status = "expired";
  invitation.expiredBy = userId;
  invitation.expiredAt = new Date();
  await invitation.save();

  logger.info("Invitation expired manually", {
    invitationId: id,
    expiredBy: userId,
    businessId,
  });

  return sendSuccess(res, "Invitation expired successfully");
});

/**
 * Resend invitation (for owners/admins)
 */
export const resendInvitation = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { activeRole, userId } = req.user;
  const { businessId } = req;

  if (!canManageInvitations(activeRole)) {
    return sendForbidden(res, "Only owners and admins can resend invitations");
  }

  const invitation = await Invitation.findOne({
    _id: id,
    businessId,
    status: "pending",
  })
    .populate("businessId", "name")
    .populate("invitedBy", "name");

  if (!invitation) {
    return sendNotFound(res, "Invitation not found or already processed");
  }

  // Generate new OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  await invitation.setOtp(otp);

  // Update sent timestamp
  invitation.sentAt = new Date();
  await invitation.save();

  // Generate invite link
  const inviteLink = invitation.getInviteLink(BASE_URL);
  const inviterName = invitation.invitedBy?.name || "A team member";

  // Send email using EmailService
  try {
    await emailService.sendResentInvitation({
      to: invitation.email,
      businessName: invitation.businessId.name,
      role: invitation.role,
      inviterName,
      inviteLink,
      otp,
    });

    logger.info("Invitation resent successfully", {
      invitationId: id,
      businessId,
      email: invitation.email,
    });

    return sendSuccess(res, "Invitation resent successfully", {
      invitationId: id,
      email: invitation.email,
      resentAt: invitation.sentAt,
    });
  } catch (emailError) {
    logger.error("Failed to resend invitation email", {
      error: emailError.message,
      invitationId: id,
      email: invitation.email,
    });
    return sendError(res, "Failed to resend invitation email", 500);
  }
});
