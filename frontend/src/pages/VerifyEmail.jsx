import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/features/auth/hooks/useAuth";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification, loading } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null);

  const inputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (!isNaN(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    if (pasteData.length > 0) {
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs[nextIndex].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    try {
      await verifyEmail({ email, code });
      setSuccess("Email verified successfully! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err.message || "Invalid or expired code";
      setError(message);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccess(null);

    // Rate limiting check: max 3 attempts in 10 minutes
    const now = Date.now();
    if (resendAttempts >= 3) {
      if (lastResendTime && now - lastResendTime < 10 * 60 * 1000) {
        setError("Maximum resend attempts reached. Please try again later.");
        return;
      } else {
        // Reset attempts if 10 minutes have passed
        setResendAttempts(0);
      }
    }

    try {
      await resendVerification(email);
      setResendAttempts((prev) => prev + 1);
      setLastResendTime(now);
      setCountdown(600); // Reset countdown
      setSuccess("New verification code sent to your email");
      setOtp(["", "", "", "", "", ""]);
      inputRefs[0].current.focus();
    } catch (err) {
      const message =
        typeof err === "string" ? err : err.message || "Failed to resend code";
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verify your email
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>. Enter
            it below to verify your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && <Alert variant="destructive">{error}</Alert>}
            {success && (
              <Alert className="border-primary text-primary">{success}</Alert>
            )}

            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="h-12 w-12 text-center text-lg font-bold"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="text-center text-sm">
              {countdown > 0 ? (
                <p className="text-muted-foreground">
                  Code expires in{" "}
                  <span className="font-medium text-foreground">
                    {formatTime(countdown)}
                  </span>
                </p>
              ) : (
                <p className="text-destructive font-medium">Code has expired</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? "Verifying..." : "Verify email"}
            </Button>
            <div className="text-center text-sm">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={
                  loading ||
                  (resendAttempts >= 3 &&
                    lastResendTime &&
                    Date.now() - lastResendTime < 10 * 60 * 1000)
                }
                className="text-primary hover:underline font-medium disabled:text-muted-foreground disabled:no-underline"
              >
                Resend OTP
              </button>
            </div>
            <Link
              to="/register"
              className="text-center text-sm text-muted-foreground hover:text-primary"
            >
              Back to registration
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VerifyEmail;
