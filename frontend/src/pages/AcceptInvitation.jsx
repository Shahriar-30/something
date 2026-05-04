import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Loader2,
  Building2,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";
import invitationService from "@/features/auth/services/invitationService";
import authService from "@/features/auth/services/authService";
import useAuthStore from "@/store/useAuthStore";

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        setLoading(true);
        const response = await invitationService.getInvitationDetails(token);
        const data = response.data.invitation;
        setInvitation(data);
        setFormData((prev) => ({
          ...prev,
          email: data.email,
          name: data.userName || "",
        }));
      } catch (err) {
        setError(err.message || "Invalid or expired invitation token.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitationDetails();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !invitation.userExists &&
      formData.password !== formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const acceptRes = await invitationService.acceptInvitation(token, {
        email: formData.email,
        name: formData.name,
        otp: formData.otp,
        role: invitation.role,
        password: formData.password,
      });

      const { business } = acceptRes.data;

      if (isAuthenticated) {
        // If already logged in, logout the user as requested
        logout();
        alert(
          `Invitation to join ${business.name} accepted! Please login again to access your new business context.`,
        );
      } else {
        // If not logged in, just redirect to login page
        alert(
          "Invitation accepted successfully! Please log in to access your account.",
        );
      }

      navigate("/login");
    } catch (err) {
      setError(
        err.message || "Failed to accept invitation. Please check your code.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-notion-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-notion-bg p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-red-600">
              Invitation Error
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-notion-bg p-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-notion-black">
            Join the Team
          </h1>
          <p className="text-muted-foreground">
            You've been invited to join{" "}
            <strong>{invitation.business.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Invitation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Business
                </Label>
                <p className="text-sm font-semibold">
                  {invitation.business.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Role
                </Label>
                <Badge variant="secondary" className="capitalize">
                  {invitation.role}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Invited By
                </Label>
                <p className="text-sm">
                  {invitation.invitedBy || "Team Member"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                {invitation.userExists
                  ? "Confirm your details and enter the verification code sent to your email."
                  : "Create your account and enter the verification code sent to your email."}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && <Alert variant="destructive">{error}</Alert>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      readOnly={invitation.userExists}
                      className={invitation.userExists ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code (OTP)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      name="otp"
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      className="pl-10"
                      value={formData.otp}
                      onChange={handleChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check your email for the verification code sent with the
                    invitation.
                  </p>
                </div>

                {!invitation.userExists && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          minLength={8}
                          className="pl-10"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          minLength={8}
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" isLoading={submitting}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {invitation.userExists
                    ? "Accept Invitation"
                    : "Create Account & Accept"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
