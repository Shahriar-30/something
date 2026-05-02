import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDedupeHash,
  extractNormalized,
  normalizeLeadValues,
} from "../services/leadService.js";

test("normalizeLeadValues keeps only schema keys", () => {
  const schema = [
    { key: "name", required: true },
    { key: "email", required: false },
  ];
  const values = normalizeLeadValues(schema, {
    name: "Jane",
    email: "jane@example.com",
    unknown: "drop",
  });

  assert.deepEqual(values, {
    name: "Jane",
    email: "jane@example.com",
  });
});

test("normalizeLeadValues throws for missing required field", () => {
  const schema = [{ key: "name", required: true }];
  assert.throws(() => normalizeLeadValues(schema, { email: "x@y.z" }));
});

test("extractNormalized reads email and phone-like keys", () => {
  const normalized = extractNormalized({
    full_name: "Jane",
    user_email: "  Jane@Example.Com ",
    phone_number: " 01234 ",
  });

  assert.equal(normalized.email, "jane@example.com");
  assert.equal(normalized.phone, "01234");
});

test("buildDedupeHash is deterministic", () => {
  const payload = {
    businessId: "b1",
    contactListId: "c1",
    normalized: {
      email: "a@b.com",
      phone: "123",
    },
  };

  const first = buildDedupeHash(payload);
  const second = buildDedupeHash(payload);
  assert.equal(first, second);
});
