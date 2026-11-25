"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";

const inputClass = "block w-full rounded border border-current/40 px-3 py-2";
const buttonClass = "rounded border border-current px-3 py-2 disabled:opacity-50";
const genericError = "Something went wrong. Please try again.";
const rateLimitError = "Too many attempts. Try again later.";

function ConfirmationLinkError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "invalid_link") return null;
  return <p role="alert">This confirmation link is invalid or expired.</p>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [pending, setPending] = useState<"login" | "resend" | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(false), 30_000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setResendEmail("");
    setResent(false);

    const emailError = validateEmail(email);
    if (emailError || !password) {
      setError(emailError ?? "Password is required.");
      return;
    }

    setPending("login");
    setError("");
    const loginEmail = email.trim();
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      switch (authError?.code) {
        case "invalid_credentials":
          setError("Invalid email or password.");
          return;
        case "email_not_confirmed":
          setError("Please verify your email first.");
          setResendEmail(loginEmail);
          return;
        case "over_request_rate_limit":
          setError(rateLimitError);
          return;
      }
      if (authError) {
        setError(authError.status === 429 ? rateLimitError : genericError);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(genericError);
    } finally {
      setPending(null);
    }
  }

  async function resend() {
    if (!resendEmail || pending || cooldown) return;
    setPending("resend");
    setError("");
    setResent(false);
    try {
      const { error: authError } = await createClient().auth.resend({
        type: "signup",
        email: resendEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (authError) {
        if (authError.status === 429) setCooldown(true);
        setError(authError.status === 429 ? rateLimitError : genericError);
        return;
      }
      setCooldown(true);
      setResent(true);
    } catch {
      setError(genericError);
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto max-w-sm space-y-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <Suspense fallback={null}>
        <ConfirmationLinkError />
      </Suspense>
      <form className="space-y-4" method="post" onSubmit={login} noValidate>
        <label className="block space-y-1">
          <span>Email</span>
          <input
            className={inputClass}
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            disabled={pending !== null}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setResendEmail("");
              setResent(false);
            }}
          />
        </label>
        <label className="block space-y-1">
          <span>Password</span>
          <input
            className={inputClass}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            disabled={pending !== null}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className={buttonClass} type="submit" disabled={pending !== null}>
          {pending === "login" ? "Logging in…" : "Login"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {resendEmail && (
        <div className="space-y-2">
          <button className={buttonClass} type="button" onClick={resend} disabled={pending !== null || cooldown}>
            {pending === "resend" ? "Sending…" : "Resend confirmation email"}
          </button>
          {cooldown && <p className="text-sm">You can resend after 30 seconds.</p>}
          {resent && <p role="status">Confirmation email sent.</p>}
        </div>
      )}
      <p>New to GuideNow? <Link className="underline" href="/signup">Sign up</Link></p>
    </main>
  );
}
