"use client";

import { useState } from "react";
import type { Company } from "@/lib/supabase/public";

type FieldDef = {
  name: keyof Omit<Company, "id" | "owner_id" | "slug" | "logo_url" | "created_at" | "updated_at">;
  label: string;
  placeholder?: string;
  mono?: boolean;
};

const FIELD_DEFS: FieldDef[] = [
  { name: "nom_entreprise", label: "Nom de l'entreprise" },
  { name: "statut_juridique", label: "Statut juridique", placeholder: "SASU, SARL, EI…" },
  { name: "adresse_entreprise", label: "Adresse de l'entreprise" },
  { name: "code_ape", label: "Code d'activité APE" },
  { name: "siren", label: "SIREN", mono: true },
  { name: "siret", label: "SIRET", mono: true },
  { name: "tva_intra", label: "Numéro de TVA intracommunautaire", mono: true },
  { name: "adresse_facturation_electronique", label: "Adresse de facturation électronique" },
  { name: "gerant", label: "Nom et prénom du gérant" },
];

export function CompanyForm({
  company,
  action,
  submitLabel,
}: {
  company?: Partial<Company>;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={action}
      onSubmit={() => setPending(true)}
      className="w-full max-w-lg flex flex-col gap-4 rounded-[20px] border p-8"
      style={{ borderColor: "var(--line)", background: "var(--paper-raised)" }}
    >
      {FIELD_DEFS.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
          {f.label}
          <input
            name={f.name}
            defaultValue={company?.[f.name] ?? ""}
            placeholder={f.placeholder}
            className={`rounded-[9px] border px-3 py-2 text-[0.95rem] ${f.mono ? "font-mono-brand" : ""}`}
            style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </label>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-[11px] font-medium text-[0.92rem] mt-1 cursor-pointer disabled:opacity-60"
        style={{ background: "var(--brass)", color: "var(--paper-raised)" }}
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
