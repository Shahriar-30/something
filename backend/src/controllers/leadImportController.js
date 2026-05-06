import crypto from "crypto";
import { ContactList } from "../models/index.js";
import {
  sendSuccess,
  sendForbidden,
  sendNotFound,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { createLeadCore } from "./leadController.js";

const parseCsv = (csvText) => {
  const lines = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index]?.trim() ?? "";
      return acc;
    }, {});
  });
};

const ingestRows = async ({
  businessId,
  userId,
  contact,
  rows,
  source,
  sourceRef = null,
}) => {
  const importBatchId = crypto.randomUUID();
  const created = [];
  const duplicates = [];
  const failed = [];

  for (const row of rows) {
    try {
      const result = await createLeadCore({
        businessId,
        actorUserId: userId,
        contact,
        payload: { values: row },
        source,
        sourceRef,
        importBatchId,
      });

      if (result.duplicate) {
        duplicates.push(result.lead._id);
      } else {
        created.push(result.lead._id);
      }
    } catch (error) {
      failed.push({
        row,
        message: error.message,
      });
    }
  }

  return {
    importBatchId,
    createdCount: created.length,
    duplicateCount: duplicates.length,
    failedCount: failed.length,
    failedRows: failed,
  };
};

export const importLeadsFromCsv = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const { csv } = req.validated.body;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const rows = parseCsv(csv);
  const result = await ingestRows({
    businessId,
    userId,
    contact,
    rows,
    source: "csv",
  });

  return sendSuccess(res, "CSV leads imported", result);
});

export const importLeadsFromWebhook = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { leads } = req.validated.body;
  const businessId = req.businessId || req.headers["x-business-id"];
  const userId = req.user?.userId || null;

  if (!businessId) {
    return sendForbidden(res, "Business context is required");
  }

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const signature = req.headers["x-webhook-signature"];
  if (!signature) {
    return sendForbidden(res, "Missing webhook signature");
  }

  const result = await ingestRows({
    businessId,
    userId,
    contact,
    rows: leads,
    source: "webhook",
    sourceRef: "webhook",
  });

  return sendSuccess(res, "Webhook leads imported", result);
});

export const importGoogleSheet = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const { sheetUrl, rows = [] } = req.validated.body;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const result = await ingestRows({
    businessId,
    userId,
    contact,
    rows,
    source: "gsheet",
    sourceRef: sheetUrl,
  });

  return sendSuccess(res, "Google Sheet import configured and synced", {
    sheetUrl,
    ...result,
  });
});

export const syncGoogleSheet = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { businessId } = req;
  const { id } = req.validated.params;
  const { rows } = req.validated.body;

  const contact = await ContactList.findActiveById(id, businessId);
  if (!contact) {
    return sendNotFound(res, "Contact list");
  }

  const result = await ingestRows({
    businessId,
    userId,
    contact,
    rows,
    source: "gsheet",
    sourceRef: "manual_sync",
  });

  return sendSuccess(res, "Google Sheet leads synced", result);
});
