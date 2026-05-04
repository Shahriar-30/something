import { apiClient } from "../../../api/client";

/**
 * Contact service for handling contact list related API calls.
 */
const contactService = {
  /**
   * Get all contact lists for the active business
   */
  getContactLists: () => apiClient.get("/contacts"),

  /**
   * Get a specific contact list by ID
   * @param {string} id - Contact list ID
   */
  getContactListById: (id) => apiClient.get(`/contacts/${id}`),

  /**
   * Create a new contact list
   * @param {Object} data - Contact list data { title, description, fieldSchema, assignmentConfig }
   */
  createContactList: (data) => apiClient.post("/contacts", data),

  /**
   * Update an existing contact list
   * @param {string} id - Contact list ID
   * @param {Object} data - Updated fields
   */
  updateContactList: (id, data) => apiClient.patch(`/contacts/${id}`, data),

  /**
   * Update field schema for a contact list
   * @param {string} id - Contact list ID
   * @param {Object} fieldSchema - New field schema
   */
  updateFieldSchema: (id, fieldSchema) =>
    apiClient.patch(`/contacts/${id}/fields`, { fieldSchema }),

  /**
   * Delete a contact list
   * @param {string} id - Contact list ID
   * @param {string} password - User password for confirmation
   */
  deleteContactList: (id, password) =>
    apiClient.delete(`/contacts/${id}`, { data: { password } }),

  /**
   * Get assignable members for a contact list
   * @param {string} id - Contact list ID
   */
  getAssignableMembers: (id) =>
    apiClient.get(`/contacts/${id}/assignable-members`),
};

export default contactService;
