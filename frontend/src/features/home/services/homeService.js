import { apiClient } from "../../../api/client";

export const getGreeting = () => {
  return apiClient.get("/hello");
};
