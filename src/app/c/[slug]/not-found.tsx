export default function CompanyNotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-16 text-center"
      style={{ background: "var(--paper)" }}
    >
      <div>
        <p className="font-display text-2xl font-semibold mb-2">Carte introuvable</p>
        <p style={{ color: "var(--ink-soft)" }}>
          Cette carte d&apos;entreprise n&apos;existe pas ou a été supprimée.
        </p>
      </div>
    </main>
  );
}
