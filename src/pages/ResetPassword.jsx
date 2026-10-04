import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const resetToken = params.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!resetToken) {
    return <AuthLayout title="Invalid link" footer={<Link to="/forgot-password">Request a new link</Link>}><p>This reset link is missing a token.</p></AuthLayout>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <AuthLayout title="New password">
      {error && <p className="text-[#ff00aa] text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required className="h-12" />
        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm" required className="h-12" />
        <Button type="submit" className="w-full h-12">Reset</Button>
      </form>
    </AuthLayout>
  );
}
