import Link from "next/link";

export default function Home() {
  return (
    <main
      className="flex flex-col flex-1 items-center justify-center gap-6 px-6 py-20 text-center"
      style={{ background: "var(--paper)" }}
    >
      <p
        className="font-display italic text-sm tracking-[0.08em] uppercase"
        style={{ color: "var(--brass)" }}
      >
        Sésame
      </p>
      <h1 className="font-display font-semibold text-4xl sm:text-5xl max-w-xl leading-tight m-0">
        La carte d&apos;identité virtuelle de votre entreprise
      </h1>
      <p className="max-w-md m-0" style={{ color: "var(--ink-soft)" }}>
        Statut juridique, SIREN, SIRET, TVA… toutes les informations
        officielles de votre entreprise, partageables en un scan NFC, un QR
        code ou un e-mail.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <Link
          href="/signup"
          className="h-11 flex items-center px-5 rounded-[11px] font-medium text-[0.92rem]"
          style={{ background: "var(--brass)", color: "var(--paper-raised)" }}
        >
          Créer mon compte
        </Link>
        <Link
          href="/login"
          className="h-11 flex items-center px-5 rounded-[11px] font-medium text-[0.92rem] border"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
