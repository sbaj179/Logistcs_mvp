"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "@/styles/Auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = supabaseBrowser();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess("We sent a verification link to your email. Verify to continue.");
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      setError("Enter your email to resend verification.");
      return;
    }
    const supabase = supabaseBrowser();
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setSuccess("Verification email resent.");
  };

  return (
    <>
      <div className={styles.header}>
        <span>Logistics OS</span>
        <h1>Create your workspace</h1>
        <p>Start tracking shipments, exceptions, and evidence.</p>
      </div>
      <Card>
        <form className={styles.actions} onSubmit={handleSignup}>
          {error ? <div className={styles.error}>{error}</div> : null}
          {success ? <div className={styles.success}>{success}</div> : null}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ops@roadline.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</Button>
          <Button type="button" variant="secondary" onClick={handleResend}>Resend verification email</Button>
        </form>
        <div className={styles.linkRow}>
          <Link className={styles.link} href="/login">Already have an account?</Link>
        </div>
      </Card>
    </>
  );
}
