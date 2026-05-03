import { apiClient } from "../../../api/client";

const businessMemberService = {
  listMembers: (params = {}) => apiClient.get(`/business-members`, { params }),
  removeMember: (userId) =>
    apiClient.patch(`/business-members/${userId}/remove`),
  updateRole: (userId, role) =>
    apiClient.patch(`/business-members/${userId}/role`, { role }),
};

export default businessMemberService;
