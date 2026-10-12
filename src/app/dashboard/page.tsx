import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/supabase/public";

export default function DashboardPage() {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-2xl m-0">Vos cartes</h1>
        <Link
          href="/dashboard/new"
          className="text-sm font-medium rounded-[10px] border px-3 py-2"
          style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
        >
          + Nouvelle carte
        </Link>
      </div>
      <Suspense fallback={<p style={{ color: "var(--ink-faint)" }}>Chargement…</p>}>
        <CompanyList />
      </Suspense>
    </div>
  );
}

async function CompanyList() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null; // filet de sécurité : le proxy a déjà redirigé

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (!companies || companies.length === 0) {
    return (
      <p style={{ color: "var(--ink-faint)" }}>
        Vous n&apos;avez pas encore de carte. Cliquez sur « Nouvelle carte » pour
        créer la première.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3 list-none p-0 m-0">
      {(companies as Company[]).map((c) => (
        <li key={c.id}>
          <Link
            href={`/dashboard/${c.id}`}
            className="block rounded-[14px] border px-4 py-3.5"
            style={{ borderColor: "var(--line)", background: "var(--paper-raised)" }}
          >
            <p className="font-medium m-0">{c.nom_entreprise || "Entreprise sans nom"}</p>
            <p className="text-sm font-mono-brand m-0 mt-0.5" style={{ color: "var(--ink-faint)" }}>
              /c/{c.slug}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
