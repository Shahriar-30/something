import { apiClient } from "../../../api/client";

const invitationService = {
  getInvitations: () => apiClient.get(`/invitations`),
  sendInvitation: (data) => apiClient.post(`/invitations`, data),
  resendInvitation: (id) => apiClient.post(`/invitations/${id}/resend`),
  expireInvitation: (id) => apiClient.patch(`/invitations/${id}/expire`),
  getInvitationDetails: (token) =>
    apiClient.get(`/invitations/accept/${token}`),
  acceptInvitation: (token, data) =>
    apiClient.post(`/invitations/accept/${token}`, data),
};

export default invitationService;
