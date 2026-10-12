"use client";

import { useState, useEffect } from "react";
import type { Company } from "@/lib/supabase/public";

// L'API Web NFC n'est pas (encore) dans les types DOM standard de TypeScript.
interface NDEFReaderLike {
  write(
    message: { records: { recordType: string; data: string }[] },
    options?: { signal?: AbortSignal }
  ): Promise<void>;
}
declare global {
  interface Window {
    NDEFReader?: new () => NDEFReaderLike;
  }
}

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

function NfcModal({ onClose }: { onClose: () => void }) {
  const [supported] = useState(() => typeof window !== "undefined" && "NDEFReader" in window);
  const [status, setStatus] = useState<"writing" | "success" | "error">("writing");
  const [errorMsg, setErrorMsg] = useState("");
  const [attempt, setAttempt] = useState(0);
  const url = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!supported || !window.NDEFReader) return;
    const controller = new AbortController();
    (async () => {
      try {
        const ndef = new window.NDEFReader!();
        await ndef.write({ records: [{ recordType: "url", data: url }] }, { signal: controller.signal });
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setErrorMsg(err instanceof Error ? err.message : "puce non détectée");
        setStatus("error");
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, attempt]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: "rgba(12,16,26,0.55)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-[300px] rounded-[20px] p-7 text-center"
        style={{ background: "var(--paper-raised)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer"
          style={{ color: "var(--ink-soft)" }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <p className="font-display font-semibold text-[1.05rem] m-0 mt-1">Configurer une puce NFC</p>

        <div className="text-left mt-3.5">
          {supported ? (
            <>
              <div
                className="flex items-center gap-2.5 p-3.5 rounded-xl text-[0.85rem] mb-3.5"
                style={{
                  background:
                    status === "success"
                      ? "color-mix(in srgb, var(--success) 14%, transparent)"
                      : status === "error"
                        ? "color-mix(in srgb, var(--danger) 12%, transparent)"
                        : "color-mix(in srgb, var(--brass) 10%, transparent)",
                  color: "var(--ink)",
                }}
              >
                {status === "writing" && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: "var(--brass)" }} />
                    <span>Approchez une puce NFC vierge du dos de votre téléphone…</span>
                  </>
                )}
                {status === "success" && (
                  <span>Puce configurée avec succès — elle ouvre désormais cette carte au scan.</span>
                )}
                {status === "error" && <span>Échec de l&apos;écriture : {errorMsg}.</span>}
              </div>
              {status === "writing" && (
                <p className="text-[0.82rem] m-0" style={{ color: "var(--ink-soft)" }}>
                  L&apos;écriture démarre automatiquement et se confirme ici.
                </p>
              )}
              {status === "error" && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus("writing");
                    setAttempt((n) => n + 1);
                  }}
                  className="w-full h-11 rounded-[11px] text-[0.88rem] font-medium cursor-pointer"
                  style={{ background: "var(--brass)", color: "var(--paper-raised)", border: "none" }}
                >
                  Réessayer
                </button>
              )}
            </>
          ) : (
            <>
              <ol className="m-0 mb-4 pl-5 grid gap-2.5 text-[0.85rem]" style={{ color: "var(--ink-soft)" }}>
                <li>
                  Installez une application gratuite d&apos;écriture NFC, comme{" "}
                  <strong style={{ color: "var(--ink)", fontWeight: 500 }}>NFC Tools</strong>.
                </li>
                <li>Dans l&apos;application, choisissez « Écrire » puis « Lien / URL ».</li>
                <li>Collez le lien ci-dessous, puis approchez une puce NFC vierge du téléphone.</li>
              </ol>
              <div className="flex items-center gap-2 border rounded-[10px] py-2 pr-2 pl-3 mb-3.5" style={{ borderColor: "var(--line)" }}>
                <span
                  className="flex-1 font-mono-brand text-[0.78rem] overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {url}
                </span>
                <CopyButton value={url} />
              </div>
              <p className="text-[0.82rem] m-0" style={{ color: "var(--ink-soft)" }}>
                L&apos;écriture directe depuis cette page n&apos;est possible que sur certains téléphones Android
                (Chrome). Ailleurs, passez par une application dédiée comme ci-dessus.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
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

  const [showNfc, setShowNfc] = useState(false);

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
      <div className="px-7 pt-4.5 pb-5 flex items-center justify-between gap-2.5 flex-wrap">
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

      {/* Actions : puce NFC (PDF / e-mail à venir) */}
      <div className="px-7 py-5 border-t flex flex-wrap gap-2.5" style={{ borderColor: "var(--line)" }}>
        <button
          type="button"
          onClick={() => setShowNfc(true)}
          className="flex-1 flex items-center justify-center gap-2 h-11 px-2.5 rounded-[11px] border text-[0.82rem] font-medium cursor-pointer transition-colors"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <path
              d="M6 8a8 8 0 0 1 12 0M8.5 10.5a4.5 4.5 0 0 1 7 0M11 13a1.3 1.3 0 1 1 2 0c0 1-1.5 1.3-1.5 3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="18.3" r="0.9" fill="currentColor" />
          </svg>
          Configurer une puce NFC
        </button>
      </div>

      {showNfc && <NfcModal onClose={() => setShowNfc(false)} />}
    </div>
  );
}
