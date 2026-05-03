import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Separator } from "@/components/ui/Separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Mail,
  UserPlus,
  MoreVertical,
  Shield,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  Save,
  AlertCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import businessMemberService from "@/features/auth/services/businessMemberService";
import invitationService from "@/features/auth/services/invitationService";
import useAuthStore from "@/store/useAuthStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "viewer", label: "Viewer" },
];

const BusinessMembers = () => {
  const { businessId } = useParams();
  const { activeBusiness } = useAuthStore();
  const { switchBusiness: refreshActiveBusiness } = useAuth();

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Action states
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [inviteData, setInviteData] = useState({ email: "", role: "staff" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const [membersRes, invitationsRes] = await Promise.all([
        businessMemberService.listMembers({ page }),
        invitationService.getInvitations(),
      ]);
      setMembers(membersRes.data.members);
      setPagination(membersRes.data.pagination);
      setInvitations(invitationsRes.data.invitations);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load business members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await invitationService.sendInvitation(inviteData);
      setSuccess("Invitation sent successfully");
      setIsInviteModalOpen(false);
      setInviteData({ email: "", role: "staff" });
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await businessMemberService.updateRole(selectedMember.user.id, newRole);
      setSuccess("Role updated successfully");
      setIsEditRoleModalOpen(false);

      // Trigger a complete refresh of active business data to ensure session consistency
      await refreshActiveBusiness(businessId);

      fetchData();
    } catch (err) {
      setError(err.message || "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await businessMemberService.removeMember(selectedMember.user.id);
      setSuccess("Member removed successfully");
      setIsRemoveModalOpen(false);

      // Trigger a complete refresh of active business data to ensure session consistency
      await refreshActiveBusiness(businessId);

      fetchData();
    } catch (err) {
      setError(err.message || "Failed to remove member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvite = async (id) => {
    try {
      await invitationService.resendInvitation(id);
      setSuccess("Invitation resent successfully");
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to resend invitation");
    }
  };

  const handleExpireInvite = async (id) => {
    try {
      await invitationService.expireInvitation(id);
      setSuccess("Invitation expired successfully");
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to expire invitation");
    }
  };

  const canManage = ["owner", "admin"].includes(activeBusiness?.role);

  const getAvailableRoleOptions = (member) => {
    // Staff and viewers cannot manage roles at all
    if (!canManage) return [];

    // Owners have unrestricted privileges
    if (activeBusiness?.role === "owner") return ROLE_OPTIONS;

    // Admins can only manage Staff and Viewer roles
    if (activeBusiness?.role === "admin") {
      if (["owner", "admin"].includes(member?.role)) return [];
      return ROLE_OPTIONS.filter((opt) =>
        ["staff", "viewer"].includes(opt.value),
      );
    }

    return [];
  };

  const canEditMember = (member) => {
    if (!canManage) return false;
    if (activeBusiness?.role === "owner") return true;
    if (activeBusiness?.role === "admin") {
      // Admin can only edit staff and viewers
      return ["staff", "viewer"].includes(member.role);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
          <p className="text-muted-foreground">
            Manage your team and their permissions.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}
      {success && (
        <Alert className="border-primary text-primary">{success}</Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Members</CardTitle>
          <CardDescription>
            People who have access to this business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {canManage && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{member.user?.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  {canEditMember(member) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setNewRole(member.role);
                            setIsEditRoleModalOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsRemoveModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-muted-foreground">
                Showing {members.length} of {pagination.total} members
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchData(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchData(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Sent invitations that haven't been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  {canManage && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {inv.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {inv.status === "pending" && (
                          <Clock className="h-3 w-3 text-yellow-500" />
                        )}
                        {inv.status === "expired" && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        {inv.status === "accepted" && (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                        <span className="capitalize">{inv.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(inv.sentAt).toLocaleDateString()}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {inv.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Resend"
                                onClick={() => handleResendInvite(inv.id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                title="Expire"
                                onClick={() => handleExpireInvite(inv.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleSendInvite} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="colleague@example.com"
              value={inviteData.email}
              onChange={(e) =>
                setInviteData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              options={ROLE_OPTIONS}
              value={inviteData.role}
              onChange={(value) =>
                setInviteData((prev) => ({ ...prev, role: value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {inviteData.role === "owner" && "Full control of the business."}
              {inviteData.role === "admin" &&
                "Can manage most aspects but cannot delete business."}
              {inviteData.role === "staff" && "Can manage contacts and leads."}
              {inviteData.role === "viewer" && "Read-only access."}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditRoleModalOpen}
        onClose={() => setIsEditRoleModalOpen(false)}
        title="Edit Member Role"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-1">
            <p className="font-medium">{selectedMember?.user?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedMember?.user?.email}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              id="edit-role"
              options={getAvailableRoleOptions(selectedMember)}
              value={newRole}
              onChange={setNewRole}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Member"
      >
        <div className="space-y-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <p>
              Are you sure you want to remove{" "}
              <strong>{selectedMember?.user?.name}</strong> from this business?
              They will lose all access immediately.
            </p>
          </Alert>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsRemoveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BusinessMembers;
