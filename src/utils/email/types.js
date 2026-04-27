/**
 * Email type enums
 * Use these constants when sending different types of emails
 */
export const EMAIL_TYPES = {
  INVITATION: "invitation",
  INVITATION_RESENT: "invitation_resent",
  PASSWORD_RESET: "password_reset",
  WELCOME: "welcome",
  NOTIFICATION: "notification",
};

/**
 * Email template configuration
 * Maps email types to their templates and subject lines
 */
export const EMAIL_TEMPLATES = {
  [EMAIL_TYPES.INVITATION]: {
    subject: (businessName) => `Invitation to join ${businessName}`,
    template: "renderInvitationEmail",
  },
  [EMAIL_TYPES.INVITATION_RESENT]: {
    subject: (businessName) => `Invitation to join ${businessName} (Resent)`,
    template: "renderResentInvitationEmail",
  },
  [EMAIL_TYPES.PASSWORD_RESET]: {
    subject: () => "Reset your password",
    template: "renderPasswordResetEmail",
  },
  [EMAIL_TYPES.WELCOME]: {
    subject: () => "Welcome to our platform",
    template: "renderWelcomeEmail",
  },
  [EMAIL_TYPES.NOTIFICATION]: {
    subject: (title) => title || "Notification",
    template: "renderNotificationEmail",
  },
};
