import { apiClient } from "../../../api/client";

/**
 * Lead service for handling lead-related API calls.
 */
const leadService = {
  /**
   * Get leads for a specific contact list
   * @param {string} listId - Contact list ID
   * @param {Object} params - Query parameters (page, limit, search, status, etc.)
   */
  getLeads: (listId, params = {}) => apiClient.get(`/contacts/${listId}/leads`, { params }),

  /**
   * Create a new lead in a contact list
   * @param {string} listId - Contact list ID
   * @param {Object} data - Lead data { values, status, source, sourceRef }
   */
  createLead: (listId, data) => apiClient.post(`/contacts/${listId}/leads`, data),

  /**
   * Update an existing lead
   * @param {string} leadId - Lead ID
   * @param {Object} data - Updated fields { values, status }
   */
  updateLead: (leadId, data) => apiClient.patch(`/leads/${leadId}`, data),

  /**
   * Delete a lead
   * @param {string} leadId - Lead ID
   */
  deleteLead: (leadId) => apiClient.delete(`/leads/${leadId}`),

  /**
   * Assign a lead to a team member
   * @param {string} leadId - Lead ID
   * @param {string} assigneeId - User ID of the assignee
   * @param {string} reason - Reason for assignment
   */
  assignLead: (leadId, assigneeId, reason = "") => 
    apiClient.post(`/leads/${leadId}/assign`, { assigneeId, reason }),

  /**
   * Import leads from CSV
   * @param {string} listId - Contact list ID
   * @param {string} csvContent - Raw CSV string
   */
  importCsv: (listId, csvContent) => 
    apiClient.post(`/contacts/${listId}/import/csv`, { csv: csvContent }),
};

export default leadService;
