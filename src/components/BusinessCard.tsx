"use client";

import { useState } from "react";
import type { Company } from "@/lib/supabase/public";

function escapeVCard(str: string | null | undefined): string {
  return String(str || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function safeFileName(str: string | null | undefined): string {
  return String(str || "contact")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

function buildVCard(c: Company): string {
  const nameParts = (c.gerant || "").trim().split(/\s+/).filter(Boolean);
  const nom = nameParts.length > 1 ? nameParts.pop()! : "";
  const prenom = nameParts.join(" ");
  const adrParts = (c.adresse_entreprise || "").split(",").map((s) => s.trim());
  const rue = adrParts[0] || "";
  const codeVille = adrParts[1] || "";
  const cpMatch = codeVille.match(/(\d{4,5})\s*(.*)/);
  const codePostal = cpMatch ? cpMatch[1] : "";
  const ville = cpMatch ? cpMatch[2] : codeVille;
  const note = [
    c.siren ? `SIREN : ${c.siren}` : null,
    c.siret ? `SIRET : ${c.siret}` : null,
    c.tva_intra ? `TVA intracommunautaire : ${c.tva_intra}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(nom)};${escapeVCard(prenom)};;;`,
    `FN:${escapeVCard(c.gerant)}`,
    `ORG:${escapeVCard(c.nom_entreprise)}`,
    "TITLE:Gérant",
    `ADR;TYPE=WORK:;;${escapeVCard(rue)};${escapeVCard(ville)};;${escapeVCard(codePostal)};France`,
    c.adresse_facturation_electronique?.includes("@")
      ? `EMAIL;TYPE=WORK:${escapeVCard(c.adresse_facturation_electronique)}`
      : null,
    note ? `NOTE:${escapeVCard(note)}` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // repli silencieux : rien d'autre à faire côté navigateur ancien
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copier"
      className="shrink-0 w-9 h-9 rounded-[10px] border flex items-center justify-center transition-colors cursor-pointer"
      style={{
        borderColor: copied ? "var(--success)" : "var(--line)",
        color: copied ? "var(--success)" : "var(--brass)",
      }}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
          <path d="M5 13l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
          <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

type FieldDef = {
  key: keyof Company;
  label: string;
  copy?: boolean;
  mono?: boolean;
};

const FIELD_DEFS: FieldDef[] = [
  { key: "adresse_entreprise", label: "Adresse de l'entreprise", copy: true },
  { key: "code_ape", label: "Code d'activité APE" },
  { key: "siren", label: "SIREN", copy: true, mono: true },
  { key: "siret", label: "SIRET", copy: true, mono: true },
  { key: "tva_intra", label: "Numéro de TVA intracommunautaire", copy: true, mono: true },
  { key: "adresse_facturation_electronique", label: "Adresse de facturation électronique", copy: true },
];

export function BusinessCard({ company }: { company: Company }) {
  const initials = (company.gerant || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleSaveContact() {
    const vcard = buildVCard(company);
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFileName(company.gerant)}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div
      className="w-full max-w-[440px] rounded-[20px] overflow-hidden border"
      style={{ background: "var(--paper-raised)", borderColor: "var(--line)", boxShadow: "0 1px 2px rgba(20,20,15,0.04)" }}
    >
      {/* En-tête */}
      <div className="relative flex items-start gap-3 px-7 pt-9 pb-6 border-b" style={{ borderColor: "var(--line)" }}>
        <div
          className="shrink-0 w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" style={{ color: "var(--ink-faint)" }}>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="m3 15 5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="9" r="1.3" fill="currentColor" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-[1.7rem] leading-tight tracking-tight m-0 mb-2">
            {company.nom_entreprise || "Entreprise sans nom"}
          </p>
          <p className="font-display italic font-medium text-base m-0" style={{ color: "var(--ink-soft)" }}>
            {company.statut_juridique}
          </p>
        </div>
        <span className="absolute left-7 -bottom-px w-11 h-[3px] rounded-sm" style={{ background: "var(--brass)" }} />
      </div>

      {/* Champs */}
      <div className="px-7 py-1.5">
        {FIELD_DEFS.map((f) => {
          const value = (company[f.key] as string) || "";
          if (!value) return null;
          return (
            <div
              key={f.key}
              className="flex items-start justify-between gap-3.5 py-4 border-b last:border-b-0"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium m-0 mb-1" style={{ color: "var(--ink-faint)" }}>
                  {f.label}
                </p>
                <p
                  className={`m-0 text-[0.95rem] leading-snug break-words ${f.mono ? "font-mono-brand text-[0.9rem] tracking-wide" : ""}`}
                >
                  {value}
                </p>
              </div>
              {f.copy && <CopyButton value={value} />}
            </div>
          );
        })}
      </div>

      {/* Pied : gérant + vCard */}
      <div className="px-7 pt-4.5 pb-7 flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0"
            style={{ background: "var(--line)", color: "var(--ink-soft)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs m-0" style={{ color: "var(--ink-faint)" }}>
              Gérant
            </p>
            <p className="text-[0.92rem] m-0 mt-0.5 font-medium">{company.gerant}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveContact}
          className="shrink-0 flex items-center gap-1.5 h-[38px] px-3.5 rounded-[11px] border text-[0.82rem] font-medium transition-colors cursor-pointer"
          style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <path d="M12 4v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Enregistrer le contact
        </button>
      </div>
    </div>
  );
}
