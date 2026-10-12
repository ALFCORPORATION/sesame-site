import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompanyForm } from "@/components/CompanyForm";
import { updateCompany, deleteCompany } from "../actions";

export default function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <Suspense fallback={<p style={{ color: "var(--ink-faint)" }}>Chargement…</p>}>
        <EditCompanyContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditCompanyContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) notFound();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) notFound();

  const boundUpdate = updateCompany.bind(null, company.id);
  const boundDelete = deleteCompany.bind(null, company.id);
  const publicPath = `/c/${company.slug}`;

  return (
    <>
      <div className="w-full max-w-lg flex items-center justify-between">
        <h1 className="font-display font-semibold text-2xl m-0">Modifier la carte</h1>
        <Link href={publicPath} target="_blank" className="text-sm underline" style={{ color: "var(--brass)" }}>
          Voir la carte publique ↗
        </Link>
      </div>

      <p className="w-full max-w-lg text-sm m-0" style={{ color: "var(--ink-faint)" }}>
        URL publique (fixe — c&apos;est elle qu&apos;utiliseront le QR code et la
        puce NFC) :{" "}
        <span className="font-mono-brand" style={{ color: "var(--ink-soft)" }}>
          {publicPath}
        </span>
      </p>

      <CompanyForm company={company} action={boundUpdate} submitLabel="Enregistrer" />

      <form action={boundDelete} className="w-full max-w-lg">
        <button type="submit" className="text-sm underline cursor-pointer" style={{ color: "var(--danger)" }}>
          Supprimer cette carte
        </button>
      </form>
    </>
  );
}
