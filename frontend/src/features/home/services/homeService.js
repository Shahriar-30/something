import { apiClient } from "../../../api/client";
import { API_BASE_URL } from "../../../config/constants";

export const getGreeting = () => {
  return apiClient(`${API_BASE_URL}/hello`);
};
