import Link from "next/link";
import { BrandLogo } from "@/components/auth/brand-panel";

// Same look as Button (md), but as links since these go to other pages.
const linkButton =
  "inline-flex h-9 items-center justify-center rounded-lg px-4 text-body-sm font-medium transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0 outline-none";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-surface p-8 text-center">
      <BrandLogo tone="brand" />
      <div className="flex flex-col gap-2">
        <h1 className="text-display text-primary">Start Your Journey</h1>
        <p className="text-body-md text-secondary">Fill those forms to set up your profile</p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/login"
          className={`${linkButton} bg-action-primary text-inverse hover:bg-action-primary-hover active:bg-action-primary-pressed`}
        >
          Login
        </Link>
        <Link
          href="/signup"
          className={`${linkButton} border border-default bg-action-secondary text-brand-600 hover:bg-action-secondary-hover active:bg-action-secondary-pressed`}
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
