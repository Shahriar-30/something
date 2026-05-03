/**
 * Role-based Access Control (RBAC) constants and utilities
 */

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  STAFF: "staff",
  VIEWER: "viewer",
};

/**
 * Checks if a user role has permission to access a specific feature or section.
 *
 * @param {string} userRole - The current role of the user (e.g., 'owner', 'admin', 'staff', 'viewer')
 * @param {Array<string>} allowedRoles - List of roles that are allowed access
 * @returns {boolean} - True if the user has access, false otherwise
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole) return false;

  // Normalized role check
  const normalizedRole = userRole.toLowerCase();
  return allowedRoles.includes(normalizedRole);
};

/**
 * Predefined permission sets for common scenarios
 */
export const PERMISSIONS = {
  MANAGE_MEMBERS: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_BILLING: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_BUSINESS: [ROLES.OWNER, ROLES.ADMIN],
  VIEW_BUSINESS: [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF],
  VIEW_REPORTS: [ROLES.OWNER, ROLES.ADMIN, ROLES.STAFF],
};
