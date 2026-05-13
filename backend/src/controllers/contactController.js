import { BusinessMember, ContactList, User } from "../models/index.js";
import {
  sendSuccess,
  sendError,
  sendForbidden,
  sendNotFound,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";
import { getActiveStaffPool } from "../services/leadService.js";

const sanitizeFieldSchema = (fieldSchema = []) => {
  return fieldSchema.map((item) => ({
    key: item.key.toLowerCase().trim(),
    label: item.label.trim(),
    type: item.type,
    options: item.options || [],
  }));
};

const validateUniqueFieldKeys = (fieldSchema = []) => {
  const seen = new Set();
  for (const field of fieldSchema) {
    if (seen.has(field.key)) {
      throw new Error(`Duplicate field key: ${field.key}`);
    }
    seen.add(field.key);
  }
};

const resolveAssignmentConfig = async (businessId, assignmentConfig = {}) => {
  const resolved = {
    mode: assignmentConfig.mode || "queue",
    strategy: assignmentConfig.strategy || "round_robin",
    assigneePool: [],
  };

  const activePool = await getActiveStaffPool(
    businessId,
    assignmentConfig.assigneePool || []
  );
  resolved.assigneePool = activePool;

  return resolved;
};

export const createContact = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const {
    title,
    description,
    fieldSchema = [],
    assignmentConfig,
  } = req.validated.body;

  const normalizedFieldSchema = sanitizeFieldSchema(fieldSchema);
  validateUniqueFieldKeys(normalizedFieldSchema);
  const resolvedAssignmentConfig = await resolveAssignmentConfig(
    businessId,
    assignmentConfig
  );

  const contact = new ContactList({
    businessId,
    title: title.trim(),
    description: description || null,
    fieldSchema: normalizedFieldSchema,
    assignmentConfig: resolvedAssignmentConfig,
    createdBy: userId,
  });
  await contact.save();

  logger.info("Contact list created", {
    contactListId: contact._id,
    businessId,
    createdBy: userId,
  });

  return sendSuccess(res, "Contact list created successfully", { contact });
});

export const getContacts = asyncHandler(async (req, res) => {
  const { businessId } = req;

  const contacts = await ContactList.find({
    businessId,
    isDeleted: false,
  })
    .populate("createdBy", "name email")
    .sort({ updatedAt: -1 });

  return sendSuccess(res, "Contact lists retrieved successfully", {
    contactLists: contacts,
  });
});

export const getContactById = asyncHandler(async (req, res) => {
  const { businessId } = req;
  const { id } = req.validated.params;

  const contact = await ContactList.findActiveById(id, businessId).populate(
    "createdBy",
    "name email"
  );
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  return sendSuccess(res, "Contact list retrieved successfully", {
    contactList: contact,
  });
});

export const updateContact = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const { title, description, assignmentConfig, fieldSchema } = req.validated.body;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  if (title !== undefined) {
    contact.title = title.trim();
  }
  if (description !== undefined) {
    contact.description = description;
  }
  if (fieldSchema !== undefined) {
    const normalizedFieldSchema = sanitizeFieldSchema(fieldSchema);
    validateUniqueFieldKeys(normalizedFieldSchema);
    contact.fieldSchema = normalizedFieldSchema;
  }
  if (assignmentConfig) {
    const resolvedAssignmentConfig = await resolveAssignmentConfig(
      businessId,
      assignmentConfig
    );
    contact.assignmentConfig = {
      ...contact.assignmentConfig.toObject(),
      ...resolvedAssignmentConfig,
    };
  }

  await contact.save();

  logger.info("Contact list updated", {
    contactListId: id,
    businessId,
    updatedBy: userId,
  });

  return sendSuccess(res, "Contact list updated successfully", { contact });
});

export const updateContactFields = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const { fieldSchema } = req.validated.body;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const normalizedFieldSchema = sanitizeFieldSchema(fieldSchema);
  validateUniqueFieldKeys(normalizedFieldSchema);
  contact.fieldSchema = normalizedFieldSchema;
  await contact.save();

  logger.info("Contact list fields updated", {
    contactListId: id,
    businessId,
    updatedBy: userId,
  });

  return sendSuccess(res, "Contact fields updated successfully", { contact });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const { password } = req.validated.body;

  // Verify user password
  const user = await User.findById(userId);
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return sendError(res, "Invalid password", 400);
  }

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  contact.isDeleted = true;
  contact.deletedAt = new Date();
  contact.deletedBy = userId;
  await contact.save();

  logger.info("Contact list deleted", {
    contactListId: id,
    businessId,
    deletedBy: userId,
  });

  return sendSuccess(res, "Contact list deleted successfully");
});

export const getContactAssignableMembers = asyncHandler(async (req, res) => {
  const { businessId } = req;
  const { id } = req.validated.params;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const staffMembers = await BusinessMember.find({
    businessId,
    role: "staff",
    status: "active",
  })
    .populate("userId", "name email")
    .sort({ joinedAt: -1 });

  const members = staffMembers.map((member) => ({
    id: member.userId?._id,
    name: member.userId?.name,
    email: member.userId?.email,
    inAssigneePool: contact.assignmentConfig.assigneePool
      .map((item) => item.toString())
      .includes(member.userId?._id?.toString()),
  }));

  return sendSuccess(res, "Assignable members retrieved successfully", {
    members,
  });
});
