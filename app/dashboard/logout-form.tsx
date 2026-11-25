"use client";

import { useActionState } from "react";

export function LogoutForm({ signOutAction }: { signOutAction: () => Promise<string> }) {
  const [error, action, pending] = useActionState(signOutAction, "");

  return (
    <form action={action} className="mt-4">
      <button type="submit" className="border px-3 py-1" disabled={pending}>
        {pending ? "Logging out…" : "Log out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
