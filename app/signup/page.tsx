"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateEmail, validatePassword } from "@/lib/validation";

const inputClass = "block w-full rounded border border-current/40 px-3 py-2";
const buttonClass = "rounded border border-current px-3 py-2 disabled:opacity-50";
const genericError = "Something went wrong. Please try again.";
const rateLimitError = "Too many attempts. Try again later.";

export default function SignupPage() {
  const [step, setStep] = useState<"email" | "password" | "confirmation">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(false), 30_000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function changeEmail() {
    setError("");
    setDuplicate(false);
    setPassword("");
    setConfirmation("");
    setStep("email");
  }

  function continueToPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError ?? "");
    if (emailError) return;
    setEmail(email.trim());
    setStep("password");
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setDuplicate(false);
    const passwordError = validatePassword(password);
    if (passwordError || password !== confirmation) {
      setError(passwordError ?? "Passwords do not match.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const { data, error: authError } = await createClient().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (
        authError?.code === "user_already_exists" ||
        authError?.code === "email_exists" ||
        (!authError && data.user?.identities?.length === 0)
      ) {
        setDuplicate(true);
        return;
      }
      if (authError) {
        setError(authError.status === 429 ? rateLimitError : genericError);
        return;
      }

      setPassword("");
      setConfirmation("");
      setCooldown(true);
      setStep("confirmation");
    } catch {
      setError(genericError);
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    if (pending || cooldown) return;
    setPending(true);
    setError("");
    setResent(false);
    try {
      const { error: authError } = await createClient().auth.resend({
        type: "signup",
        email,
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
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm space-y-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      {step === "email" && (
        <form className="space-y-4" method="post" onSubmit={continueToPassword} noValidate>
          <label className="block space-y-1">
            <span>Email</span>
            <input
              className={inputClass}
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className={buttonClass} type="submit">Continue</button>
        </form>
      )}
      {step === "password" && (
        <form className="space-y-4" method="post" onSubmit={signUp} noValidate>
          <p className="break-all">{email}</p>
          <button className="underline disabled:opacity-50" type="button" onClick={changeEmail} disabled={pending}>
            Change email
          </button>
          <label className="block space-y-1">
            <span>Password</span>
            <input
              className={inputClass}
              type="password"
              name="password"
              autoComplete="new-password"
              aria-describedby="password-rules"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
              autoFocus
            />
          </label>
          <p id="password-rules" className="text-sm">
            Use 6 to 15 characters with at least one letter and one number.
          </p>
          <label className="block space-y-1">
            <span>Confirm password</span>
            <input
              className={inputClass}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={pending}
            />
          </label>
          <button className={buttonClass} type="submit" disabled={pending}>
            {pending ? "Signing up…" : "Sign up"}
          </button>
        </form>
      )}
      {step === "confirmation" && (
        <div className="space-y-3">
          <p role="status">Check your email for a confirmation link.</p>
          <button className={buttonClass} type="button" onClick={resend} disabled={pending || cooldown}>
            {pending ? "Sending…" : "Resend"}
          </button>
          {cooldown && <p className="text-sm">You can resend after 30 seconds.</p>}
          {resent && <p role="status">Confirmation email sent.</p>}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {duplicate ? (
        <p role="alert">User already exists. <Link className="underline" href="/login">Please log in.</Link></p>
      ) : (
        <p>Already have an account? <Link className="underline" href="/login">Log in</Link></p>
      )}
    </main>
  );
}
