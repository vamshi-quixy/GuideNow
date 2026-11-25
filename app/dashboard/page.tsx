import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LogoutForm } from "./logout-form";

async function signOut() {
  "use server";
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return "Logout could not be confirmed. Try again.";
  } catch {
    return "Logout could not be confirmed. Try again.";
  }
  redirect("/login");
}

async function UserInfo() {
  // Supabase's client calls Date.now(); defer to request time.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <>
      <p className="mt-2">Signed in as {data.user.email}</p>
      <LogoutForm signOutAction={signOut} />
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <Suspense fallback={<p className="mt-2">Loading…</p>}>
        <UserInfo />
      </Suspense>
    </main>
  );
}
