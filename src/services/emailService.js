/**
 * Email Service
 *
 * Centralized service for sending different types of emails.
 * This layer abstracts the email provider and template rendering.
 *
 * Usage:
 *   const emailService = new EmailService();
 *   await emailService.sendInvitation({
 *     to: "user@example.com",
 *     businessName: "Acme Corp",
 *     role: "staff",
 *     inviterName: "John Doe",
 *     inviteLink: "https://...",
 *     otp: "123456"
 *   });
 */

import { sendEmail } from "../utils/email/sendEmail.js";
import { EMAIL_TYPES } from "../utils/email/types.js";
import {
  renderInvitationEmail,
  renderResentInvitationEmail,
} from "../utils/email/templates.js";
import { logger } from "../config/logger.js";

export class EmailService {
  /**
   * Send invitation email
   */
  async sendInvitation({
    to,
    businessName,
    role,
    inviterName,
    inviteLink,
    otp,
  }) {
    try {
      const html = renderInvitationEmail({
        businessName,
        role,
        inviterName,
        inviteLink,
        otp,
      });

      const subject = `Invitation to join ${businessName}`;

      await sendEmail({
        to,
        subject,
        html,
      });

      logger.info("Invitation email sent", { to, businessName, role });
      return { success: true, type: EMAIL_TYPES.INVITATION };
    } catch (error) {
      logger.error("Failed to send invitation email", {
        to,
        businessName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send resent invitation email
   */
  async sendResentInvitation({
    to,
    businessName,
    role,
    inviterName,
    inviteLink,
    otp,
  }) {
    try {
      const html = renderResentInvitationEmail({
        businessName,
        role,
        inviterName,
        inviteLink,
        otp,
      });

      const subject = `Invitation to join ${businessName} (Resent)`;

      await sendEmail({
        to,
        subject,
        html,
      });

      logger.info("Resent invitation email sent", { to, businessName, role });
      return { success: true, type: EMAIL_TYPES.INVITATION_RESENT };
    } catch (error) {
      logger.error("Failed to send resent invitation email", {
        to,
        businessName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} options
   * @param {string} options.to - recipient email
   * @param {string} options.resetLink - password reset link
   * @param {string} [options.userName] - user's name
   */
  async sendPasswordReset({ to, resetLink, userName = "User" }) {
    try {
      // TODO: Add renderPasswordResetEmail template
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6c757d; font-size: 14px;">If you did not request this, ignore this email.</p>
        </div>
      `;

      await sendEmail({
        to,
        subject: "Reset your password",
        html,
      });

      logger.info("Password reset email sent", { to });
      return { success: true, type: EMAIL_TYPES.PASSWORD_RESET };
    } catch (error) {
      logger.error("Failed to send password reset email", {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcome({ to, userName, businessName }) {
    try {
      // TODO: Add renderWelcomeEmail template
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${businessName}!</h2>
          <p>Hi ${userName},</p>
          <p>Your account has been successfully created. You're all set to start using our platform.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
      `;

      await sendEmail({
        to,
        subject: "Welcome to our platform",
        html,
      });

      logger.info("Welcome email sent", { to, businessName });
      return { success: true, type: EMAIL_TYPES.WELCOME };
    } catch (error) {
      logger.error("Failed to send welcome email", {
        to,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send generic notification email
   */
  async sendNotification({ to, title, message, actionUrl, actionText }) {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${title}</h2>
          <p>${message}</p>
          ${
            actionUrl && actionText
              ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${actionText}
              </a>
            </div>
          `
              : ""
          }
        </div>
      `;

      await sendEmail({
        to,
        subject: title,
        html,
      });

      logger.info("Notification email sent", { to, title });
      return { success: true, type: EMAIL_TYPES.NOTIFICATION };
    } catch (error) {
      logger.error("Failed to send notification email", {
        to,
        title,
        error: error.message,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
