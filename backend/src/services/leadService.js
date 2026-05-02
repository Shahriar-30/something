import crypto from "crypto";
import { BusinessMember, LeadRow } from "../models/index.js";

export const canDeleteByRole = (role) => ["owner", "admin"].includes(role);
export const canMutateByRole = (role) => ["owner", "admin", "staff"].includes(role);
export const canViewByRole = (role) =>
  ["owner", "admin", "staff", "viewer"].includes(role);

export const normalizeLeadValues = (fieldSchema = [], inputValues = {}) => {
  const values = {};
  const schemaByKey = new Map(fieldSchema.map((item) => [item.key, item]));

  for (const [key, value] of Object.entries(inputValues || {})) {
    if (!schemaByKey.has(key)) {
      continue;
    }

    values[key] = value;
  }

  for (const field of fieldSchema) {
    if (field.required && !Object.prototype.hasOwnProperty.call(values, field.key)) {
      throw new Error(`Missing required field: ${field.key}`);
    }
  }

  return values;
};

export const extractNormalized = (values = {}) => {
  const normalized = {
    email: null,
    phone: null,
  };

  for (const [key, raw] of Object.entries(values)) {
    if (typeof raw !== "string") {
      continue;
    }

    const lowerKey = key.toLowerCase();
    if (!normalized.email && lowerKey.includes("email")) {
      normalized.email = raw.toLowerCase().trim();
    }
    if (!normalized.phone && lowerKey.includes("phone")) {
      normalized.phone = raw.trim();
    }
  }

  return normalized;
};

export const buildDedupeHash = ({ businessId, contactListId, normalized }) => {
  const fingerprint = `${businessId}:${contactListId}:${normalized.email || ""}:${
    normalized.phone || ""
  }`;
  return crypto.createHash("sha256").update(fingerprint).digest("hex");
};

export const getActiveStaffPool = async (businessId, assigneePool = []) => {
  if (!assigneePool?.length) {
    return [];
  }

  const members = await BusinessMember.find({
    businessId,
    userId: { $in: assigneePool },
    role: "staff",
    status: "active",
  })
    .select("userId")
    .lean();

  return members.map((m) => m.userId.toString());
};

export const pickAssignee = async ({
  businessId,
  contactList,
  candidates = [],
}) => {
  if (!candidates.length) {
    return null;
  }

  if (contactList.assignmentConfig.strategy === "least_loaded") {
    const counts = await Promise.all(
      candidates.map(async (userId) => {
        const count = await LeadRow.countDocuments({
          businessId,
          contactListId: contactList._id,
          assigneeId: userId,
          status: { $in: ["new", "open"] },
        });
        return { userId, count };
      })
    );

    counts.sort((a, b) => a.count - b.count);
    return counts[0]?.userId || null;
  }

  const currentCursor = contactList.assignmentConfig.roundRobinCursor || 0;
  const index = currentCursor % candidates.length;
  const chosen = candidates[index];
  contactList.assignmentConfig.roundRobinCursor = currentCursor + 1;
  await contactList.save();

  return chosen;
};
