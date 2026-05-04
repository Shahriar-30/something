import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Separator } from "@/components/ui/Separator";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Building2,
  KeyRound,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Modal from "@/components/ui/Modal";
import authService from "@/features/auth/services/authService";

const AccountSettings = () => {
  const { user, activeBusiness } = useAuthStore();
  const { logout } = useAuth();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your account details. These fields are read-only.
              </CardDescription>
            </div>
            {user?.emailVerified ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 px-2 py-0.5">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 px-2 py-0.5">
                Unverified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Full Name</Label>
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50 border border-transparent">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user?.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email Address</Label>
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50 border border-transparent">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user?.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Active Business</Label>
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50 border border-transparent">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {activeBusiness?.name || "None"}
                </span>
                {activeBusiness?.role && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-[10px] uppercase"
                  >
                    {activeBusiness.role}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Verification Status
              </Label>
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50 border border-transparent">
                {user?.emailVerified ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">
                      Email Verified
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-destructive">
                      Email Unverified
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Access</CardTitle>
          <CardDescription>
            Manage your password and session security.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
          <Button variant="destructive" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => !loading && setIsPasswordModalOpen(false)}
        title="Change Password"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              isLoading={loading}
              disabled={
                !passwordData.currentPassword ||
                !passwordData.newPassword
              }
              className="gap-2"
            >
              Update Password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}
          {success && (
            <Alert className="border-primary text-primary bg-primary/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter your current password"
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Repeat new password"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountSettings;
