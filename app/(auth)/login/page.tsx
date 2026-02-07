"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "@/styles/Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = supabaseClient;
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const user = data.session?.user;
    if (!user?.email_confirmed_at) {
      setSuccess("Email not verified yet. Please verify to continue.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      setError("Enter your email to resend verification.");
      return;
    }
    const supabase = supabaseClient;
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
        <h1>Welcome back</h1>
        <p>Sign in to your operational workspace.</p>
      </div>
      <Card>
        <form className={styles.actions} onSubmit={handleLogin}>
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
          <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          <Button type="button" variant="secondary" onClick={handleResend}>Resend verification email</Button>
        </form>
        <div className={styles.linkRow}>
          <Link className={styles.link} href="/signup">Create an account</Link>
          <Link className={styles.link} href="/verify-email">Verify email</Link>
        </div>
      </Card>
    </>
  );
}
