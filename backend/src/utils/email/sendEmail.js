import { Resend } from "resend";

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send an email using Resend.
 * The function is centralized so email delivery can be reused across the project.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Optional plain text fallback
 * @param {string} [options.from] - Sender address
 * @returns {Promise<Object>} Resend response
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from = process.env.EMAIL_FROM,
}) => {
  if (!resendClient) {
    throw new Error("Resend API key is not configured");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is not configured");
  }

  return resendClient.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });
};
