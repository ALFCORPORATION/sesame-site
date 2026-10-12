import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabase, type Company } from "@/lib/supabase/public";
import { BusinessCard } from "@/components/BusinessCard";

// Le slug n'est connu qu'à l'exécution (les entreprises sont créées après le
// déploiement), donc ce composant de page reste synchrone et délègue la
// lecture de `params` + l'appel Supabase à un enfant englobé dans
// <Suspense> : le "shell" statique (fond, centrage) peut tout de même être
// pré-rendu, seul le contenu de la carte est chargé à la demande.
export default function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "var(--paper)" }}
    >
      <Suspense fallback={<CardSkeleton />}>
        <CardContent params={params} />
      </Suspense>
    </main>
  );
}

async function CardContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();
  return <BusinessCard company={company} />;
}

async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Erreur Supabase (lecture de la carte) :", error.message);
    return null;
  }
  return data as Company | null;
}

function CardSkeleton() {
  return (
    <div
      className="w-full max-w-[440px] h-[420px] rounded-[20px] border animate-pulse"
      style={{ borderColor: "var(--line)", background: "var(--paper-raised)" }}
    />
  );
}
