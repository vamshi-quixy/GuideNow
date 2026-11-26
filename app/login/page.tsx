"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { BrandLogo, BrandPanel } from "@/components/auth/brand-panel";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";

/*
 * Login screen. Figma: "2.0 Version Designs", frame RU (351:2576).
 * Two panels side by side that stack when there's no room for both
 * (each needs at least 288px).
 */

const genericError = "Something went wrong. Please try again.";
const rateLimitError = "Too many attempts. Try again later.";

const linkClass =
  "rounded-sm text-link hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring";

type FieldErrors = { email?: string; password?: string };

function ConfirmationLinkError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "invalid_link") return null;
  return (
    <p role="alert" className="text-body-sm text-error">
      This confirmation link is invalid or expired.
    </p>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    setError("");

    const emailError = validateEmail(email);
    const passwordError = password ? undefined : "Password is required.";
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError ?? undefined, password: passwordError });
      return;
    }

    setPending("login");
    setFieldErrors({});
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

      setEmail("");
      setPassword("");
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
    <main className="flex flex-1 flex-wrap gap-4 bg-surface p-4">
      <BrandPanel />

      <section className="flex min-h-100 min-w-72 flex-[1_0_0] flex-col items-center justify-center overflow-clip rounded-3xl bg-surface py-6">
        <div className="flex w-full flex-col items-center gap-6 px-8">
          <BrandLogo tone="brand" className="md:hidden" />
          <h1 className="w-full max-w-114 text-center text-display text-primary">Login</h1>

          <form
            className="flex w-full max-w-114 flex-col gap-4"
            method="post"
            onSubmit={login}
            noValidate
          >
            <Suspense fallback={null}>
              <ConfirmationLinkError />
            </Suspense>

            <div className="flex flex-col gap-6">
              <InputField
                label="Email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="Enter Email"
                value={email}
                error={fieldErrors.email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((errors) => ({ ...errors, email: undefined }));
                  setError("");
                  setResendEmail("");
                  setResent(false);
                }}
              />
              <InputField
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter Password"
                value={password}
                error={fieldErrors.password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((errors) => ({ ...errors, password: undefined }));
                  setError("");
                }}
              />
              {/* No reset flow yet; this route still needs building. */}
              <Link
                href="/forgot-password"
                className="self-end rounded-sm text-body-sm text-link hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {error && (
                <p role="alert" className="text-body-sm text-error">
                  {error}
                </p>
              )}
              {resendEmail && (
                <div className="flex flex-col items-start gap-2">
                  <Button
                    variant="secondary"
                    onClick={resend}
                    loading={pending === "resend"}
                    disabled={pending === "login" || cooldown}
                  >
                    Resend confirmation email
                  </Button>
                  {cooldown && (
                    <p className="text-caption text-tertiary">You can resend after 30 seconds.</p>
                  )}
                  {resent && (
                    <p role="status" className="text-caption text-success">
                      Confirmation email sent.
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={pending === "login"}
                disabled={pending === "resend"}
              >
                Login
              </Button>
              <p className="flex flex-wrap items-center justify-center gap-x-1 text-body-sm">
                <span className="text-secondary">Don’t have an account?</span>
                <Link href="/signup" className={linkClass}>
                  Create New
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
