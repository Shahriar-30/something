/**
 * Render HTML for a business invitation email.
 */
export const renderInvitationEmail = ({
  businessName,
  role,
  inviterName,
  inviteLink,
  otp,
}) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>You've been invited to join ${businessName}</h2>
  <p>You have been invited to join <strong>${businessName}</strong> as a <strong>${role}</strong>.</p>

  <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p><strong>Business:</strong> ${businessName}</p>
    <p><strong>Role:</strong> ${role}</p>
    <p><strong>Invited by:</strong> ${inviterName}</p>
  </div>

  <p>To accept this invitation:</p>
  <ol>
    <li>Click the invitation link below</li>
    <li>Enter the verification code: <strong style="font-size: 18px; color: #007bff;">${otp}</strong></li>
    <li>Create your account or sign in</li>
  </ol>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Accept Invitation
    </a>
  </div>

  <p style="color: #6c757d; font-size: 14px;">
    This invitation link will remain active until manually expired by a business owner or admin.
  </p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">

  <p style="color: #6c757d; font-size: 12px;">
    If you did not expect this invitation, you can safely ignore this email.
  </p>
</div>
`;

/**
 * Render HTML for a resent invitation email.
 */
export const renderResentInvitationEmail = ({
  businessName,
  role,
  inviterName,
  inviteLink,
  otp,
}) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Invitation to join ${businessName}</h2>
  <p>This is a resent invitation. You have been invited to join <strong>${businessName}</strong> as a <strong>${role}</strong>.</p>

  <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p><strong>Business:</strong> ${businessName}</p>
    <p><strong>Role:</strong> ${role}</p>
    <p><strong>Invited by:</strong> ${inviterName}</p>
  </div>

  <p>To accept this invitation:</p>
  <ol>
    <li>Click the invitation link below</li>
    <li>Enter the verification code: <strong style="font-size: 18px; color: #007bff;">${otp}</strong></li>
    <li>Create your account or sign in</li>
  </ol>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Accept Invitation
    </a>
  </div>

  <p style="color: #6c757d; font-size: 14px;">
    This invitation link will remain active until manually expired by a business owner or admin.
  </p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">

  <p style="color: #6c757d; font-size: 12px;">
    If you did not expect this invitation, you can safely ignore this email.
  </p>
</div>
`;
