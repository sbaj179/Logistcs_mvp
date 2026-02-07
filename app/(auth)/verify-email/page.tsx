"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "@/styles/Auth.module.css";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState("We sent a verification link to your email. Verify to continue.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseClient;
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email_confirmed_at) {
        clearInterval(interval);
        router.push("/dashboard");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const handleResend = async () => {
    setError(null);
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
    setMessage("Verification email resent. Please check your inbox.");
  };

  return (
    <>
      <div className={styles.header}>
        <span>Logistics OS</span>
        <h1>Verify your email</h1>
        <p>Access is unlocked after you confirm your email address.</p>
      </div>
      <Card>
        <div className={styles.actions}>
          {message ? <div className={styles.success}>{message}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
          <p>Open the verification email and click the link to activate your account.</p>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ops@roadline.com"
          />
          <Button onClick={handleResend}>Resend verification email</Button>
          <Button variant="secondary" onClick={() => router.push("/login")}>Back to login</Button>
        </div>
        <div className={styles.linkRow}>
          <Link className={styles.link} href="/signup">Need an account?</Link>
          <Link className={styles.link} href="/login">Sign in</Link>
        </div>
      </Card>
    </>
  );
}
