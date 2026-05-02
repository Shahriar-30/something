import React from "react";
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
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

const AccountSettings = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and how others see you.
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
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  defaultValue={user?.name}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Access</CardTitle>
          <CardDescription>
            Manage your password and session.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="destructive" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
