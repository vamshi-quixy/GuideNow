"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { BrandLogo, BrandPanel } from "@/components/auth/brand-panel";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { createClient } from "@/lib/supabase/client";
import {
  PASSWORD_RULES,
  validateEmail,
  validatePassword,
} from "@/lib/validation";

/*
 * Sign-up screen. Figma: "2.0 Version Designs", User — Create account (396:1187).
 * Same two-panel layout as the login screen; email and password in one step.
 */

const genericError = "Something went wrong. Please try again.";
const rateLimitError = "Too many attempts. Try again later.";
const linkClass =
  "rounded-sm text-link hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring";

type Field = "email" | "password" | "confirmation" | "terms";
type FieldErrors = Partial<Record<Field, string>>;

export default function SignupPage() {
  const termsErrorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(false), 30_000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function clearError(field: Field) {
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
    setError("");
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const errors: FieldErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmation: !confirmation
        ? "Re-enter your password."
        : confirmation !== password
          ? "Passwords do not match."
          : undefined,
      terms: agreed
        ? undefined
        : "Agree to the Terms of Service and Privacy Policy to continue.",
    };
    setFieldErrors(errors);
    setError("");
    if (Object.values(errors).some(Boolean)) return;

    setPending(true);
    const signupEmail = email.trim();
    try {
      const { error: authError } = await createClient().auth.signUp({
        email: signupEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      // An existing account gets the same response, so emails can't be probed.
      if (
        authError &&
        authError.code !== "user_already_exists" &&
        authError.code !== "email_exists"
      ) {
        setError(authError.status === 429 ? rateLimitError : genericError);
        return;
      }

      setPassword("");
      setConfirmation("");
      setCooldown(true);
      setSentTo(signupEmail);
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
        email: sentTo,
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

  function startOver() {
    setSentTo("");
    setError("");
    setResent(false);
    setAgreed(false);
  }

  return (
    <main className="flex flex-1 flex-wrap gap-4 bg-surface p-4">
      <BrandPanel />

      <section className="flex min-h-100 min-w-72 flex-[1_0_0] flex-col items-center justify-center overflow-clip rounded-3xl bg-surface py-6">
        {/* Side padding lives inside, so both panels split the row evenly. */}
        <div className="flex w-full justify-center px-6">
          <div className="flex w-full max-w-114 flex-col gap-4">
            <BrandLogo tone="brand" className="self-center md:hidden" />
            {sentTo ? (
              <>
                <div className="flex flex-col gap-3 text-center">
                  <h1 className="text-display text-primary">
                    Check your inbox
                  </h1>
                  <p role="status" className="text-body-md text-secondary">
                    We sent a confirmation link to{" "}
                    <span className="break-all text-primary">{sentTo}</span>.
                  </p>
                </div>
                {error && (
                  <p role="alert" className="text-body-sm text-error">
                    {error}
                  </p>
                )}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={resend}
                  loading={pending}
                  disabled={cooldown}
                >
                  Resend email
                </Button>
                {cooldown && (
                  <p className="text-center text-caption text-tertiary">
                    You can resend after 30 seconds.
                  </p>
                )}
                {resent && (
                  <p
                    role="status"
                    className="text-center text-caption text-success"
                  >
                    Confirmation email sent.
                  </p>
                )}
                <Button
                  variant="tertiary"
                  className="self-center"
                  onClick={startOver}
                >
                  Use a different email
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 text-center">
                  <h1 className="text-display text-primary">
                    Create your account
                  </h1>
                  <p className="text-body-md text-secondary">
                    Set up your Provia account to get started.
                  </p>
                </div>

                <form
                  className="flex flex-col gap-4"
                  method="post"
                  onSubmit={signUp}
                  noValidate
                >
                  <div className="flex flex-col gap-3">
                    <InputField
                      label="Work email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      error={fieldErrors.email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        clearError("email");
                      }}
                    />
                    <InputField
                      label="Password"
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="Create password"
                      helperText={PASSWORD_RULES}
                      value={password}
                      error={fieldErrors.password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearError("password");
                      }}
                    />
                    <InputField
                      label="Confirm password"
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={confirmation}
                      error={fieldErrors.confirmation}
                      onChange={(event) => {
                        setConfirmation(event.target.value);
                        clearError("confirmation");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="flex cursor-pointer items-center text-caption text-secondary">
                      <span className="flex size-8 shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          name="terms"
                          checked={agreed}
                          aria-invalid={fieldErrors.terms ? true : undefined}
                          aria-describedby={
                            fieldErrors.terms ? termsErrorId : undefined
                          }
                          className="size-4 cursor-pointer accent-action-primary"
                          onChange={(event) => {
                            setAgreed(event.target.checked);
                            clearError("terms");
                          }}
                        />
                      </span>
                      I agree to the Terms of Service and Privacy Policy.
                    </label>
                    {fieldErrors.terms && (
                      <p id={termsErrorId} className="text-caption text-error">
                        {fieldErrors.terms}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p role="alert" className="text-body-sm text-error">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full" loading={pending}>
                    Create account
                  </Button>
                </form>
              </>
            )}

            <p className="flex flex-wrap items-center justify-center gap-x-1 text-body-sm">
              <span className="text-secondary">Already have an account?</span>
              <Link href="/login" className={linkClass}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
