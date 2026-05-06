import {
  BusinessMember,
  ContactList,
  LeadAssignmentLog,
  LeadRow,
} from "../models/index.js";
import {
  sendSuccess,
  sendForbidden,
  sendNotFound,
  sendConflict,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";
import {
  buildDedupeHash,
  extractNormalized,
  getActiveStaffPool,
  normalizeLeadValues,
  pickAssignee,
} from "../services/leadService.js";

const createLeadCore = async ({
  businessId,
  actorUserId,
  contact,
  payload,
  source = "manual",
  sourceRef = null,
  importBatchId = null,
}) => {
  const values = normalizeLeadValues(contact.fieldSchema, payload.values || {});
  const normalized = extractNormalized(values);
  const dedupeHash = buildDedupeHash({
    businessId,
    contactListId: contact._id.toString(),
    normalized,
  });

  if (normalized.email || normalized.phone) {
    const existing = await LeadRow.findOne({
      businessId,
      contactListId: contact._id,
      dedupeHash,
    });
    if (existing) {
      return { duplicate: true, lead: existing };
    }
  }

  const lead = new LeadRow({
    businessId,
    contactListId: contact._id,
    values,
    normalized,
    status: payload.status || "new",
    source,
    sourceRef,
    importBatchId,
    createdBy: actorUserId || null,
    dedupeHash: normalized.email || normalized.phone ? dedupeHash : null,
  });

  if (contact.assignmentConfig.mode === "auto") {
    const candidates = await getActiveStaffPool(
      businessId,
      contact.assignmentConfig.assigneePool
    );
    const assigneeId = await pickAssignee({
      businessId,
      contactList: contact,
      candidates,
    });
    if (assigneeId) {
      lead.assigneeId = assigneeId;
      lead.assignmentState = "assigned";
    }
  }

  await lead.save();
  return { duplicate: false, lead };
};

export const createLead = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const payload = req.validated.body;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const result = await createLeadCore({
    businessId,
    actorUserId: userId,
    contact,
    payload,
    source: payload.source || "manual",
    sourceRef: payload.sourceRef || null,
  });

  if (result.duplicate) {
    return sendConflict(
      res,
      "Duplicate lead detected for this contact list (email/phone match)"
    );
  }

  return sendSuccess(res, "Lead created successfully", { lead: result.lead });
});

export const getLeads = asyncHandler(async (req, res) => {
  const { businessId } = req;
  const { id } = req.validated.params;
  const {
    page = 1,
    limit = 25,
    search,
    status,
    assignmentState,
    assigneeId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.validated.query;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const query = {
    businessId,
    contactListId: id,
  };

  if (status) {
    query.status = status;
  }
  if (assignmentState) {
    query.assignmentState = assignmentState;
  }
  if (assigneeId) {
    query.assigneeId = assigneeId;
  }
  if (search) {
    query.$or = [
      { "normalized.email": { $regex: search, $options: "i" } },
      { "normalized.phone": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [leads, total] = await Promise.all([
    LeadRow.find(query)
      .populate("assigneeId", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    LeadRow.countDocuments(query),
  ]);

  return sendSuccess(res, "Leads retrieved successfully", {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const updateLead = asyncHandler(async (req, res) => {
  const { businessId } = req;
  const { leadId } = req.validated.params;
  const { values, status } = req.validated.body;

  const lead = await LeadRow.findActiveById(leadId, businessId);
  if (!lead) {
    return sendNotFound(res, "Lead");
  }

  const contact = await ContactList.findActiveById(
    lead.contactListId,
    businessId
  );
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  if (values) {
    const normalizedValues = normalizeLeadValues(contact.fieldSchema, {
      ...Object.fromEntries(lead.values || new Map()),
      ...values,
    });
    lead.values = normalizedValues;
    lead.normalized = extractNormalized(normalizedValues);
  }
  if (status) {
    lead.status = status;
  }
  lead.lastActivityAt = new Date();
  await lead.save();

  return sendSuccess(res, "Lead updated successfully", { lead });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const { businessId } = req;
  const { leadId } = req.validated.params;

  const lead = await LeadRow.findActiveById(leadId, businessId);
  if (!lead) {
    return sendNotFound(res, "Lead");
  }

  await LeadRow.deleteOne({ _id: leadId, businessId });
  return sendSuccess(res, "Lead deleted successfully");
});

export const assignLead = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { leadId } = req.validated.params;
  const { assigneeId, reason } = req.validated.body;

  const lead = await LeadRow.findActiveById(leadId, businessId);
  if (!lead) {
    return sendNotFound(res, "Lead");
  }

  const contact = await ContactList.findActiveById(
    lead.contactListId,
    businessId
  );
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const activePool = await getActiveStaffPool(
    businessId,
    contact.assignmentConfig.assigneePool
  );
  if (!activePool.includes(assigneeId)) {
    return sendForbidden(
      res,
      "Assignee must be an active staff in this contact pool"
    );
  }

  const membership = await BusinessMember.findOne({
    businessId,
    userId: assigneeId,
    status: "active",
    role: "staff",
  });
  if (!membership) {
    return sendForbidden(res, "Assignee is not eligible for assignment");
  }

  const fromAssignee = lead.assigneeId || null;
  lead.assigneeId = assigneeId;
  lead.assignmentState = fromAssignee ? "reassigned" : "assigned";
  lead.lastActivityAt = new Date();
  await lead.save();

  await LeadAssignmentLog.create({
    leadId: lead._id,
    businessId,
    fromAssignee,
    toAssignee: assigneeId,
    reason: reason || null,
    assignedBy: userId,
  });

  logger.info("Lead assignment updated", {
    leadId,
    businessId,
    assignedBy: userId,
    assigneeId,
  });

  return sendSuccess(res, "Lead assigned successfully", { lead });
});

export { createLeadCore };
