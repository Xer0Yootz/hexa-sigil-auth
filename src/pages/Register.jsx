import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = "/character-creation";
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <AuthLayout icon={UserPlus} title="Verify" subtitle={email}>
        {error && <p className="text-[#ff00aa] text-sm mb-3">{error}</p>}
        <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Code" className="h-12 mb-4" />
        <Button className="w-full h-12" onClick={handleVerify} disabled={loading}>Verify</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={UserPlus} title="Create account" footer={<Link to="/login">Sign in</Link>}>
      {error && <p className="text-[#ff00aa] text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" /></div>
        <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" /></div>
        <div><Label>Confirm</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-12" /></div>
        <Button type="submit" className="w-full h-12" disabled={loading}>Create</Button>
      </form>
    </AuthLayout>
  );
}
