import { apiClient } from "../../../api/client";

/**
 * Business service for handling all business-related API calls.
 */
const businessService = {
  /**
   * Get all businesses for the current user
   */
  getMyBusinesses: () => apiClient.get("/businesses"),

  /**
   * Get a specific business by ID
   * @param {string} id - Business ID
   */
  getBusinessById: (id) => apiClient.get(`/businesses/${id}`),

  /**
   * Create a new business
   * @param {Object} data - Business data { name, logoUrl, currency, location, phoneNumber, phoneCountry }
   */
  createBusiness: (data) => apiClient.post("/businesses", data),

  /**
   * Update an existing business
   * @param {string} id - Business ID
   * @param {Object} data - Updated fields
   */
  updateBusiness: (id, data) => apiClient.patch(`/businesses/${id}`, data),

  /**
   * Delete a business (soft delete)
   * @param {string} id - Business ID
   */
  deleteBusiness: (id) => apiClient.delete(`/businesses/${id}`),
};

export default businessService;
