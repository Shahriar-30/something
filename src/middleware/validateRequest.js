import { sendValidationError } from "../utils/response/error.js";

export const validateRequest = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    const formattedErrors = parsed.error.errors.map((error) => ({
      path: error.path.join("."),
      message: error.message,
      value: error.code === "invalid_type" ? undefined : error.received,
    }));

    return sendValidationError(res, formattedErrors);
  }

  req.validated = parsed.data;
  return next();
};
