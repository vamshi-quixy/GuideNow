import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
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
      <form action={signOut} className="mt-4">
        <button type="submit" className="border px-3 py-1">
          Log out
        </button>
      </form>
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
