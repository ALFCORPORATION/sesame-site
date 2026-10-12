"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="w-full max-w-lg flex flex-col gap-3 rounded-[20px] border p-8"
      style={{ borderColor: "var(--line)", background: "var(--paper-raised)" }}
    >
      <p className="font-display font-semibold text-xl m-0">Une erreur est survenue</p>
      <p className="text-sm m-0" style={{ color: "var(--ink-soft)" }}>
        {error.message || "Quelque chose s'est mal passé. Réessayez."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-10 rounded-[10px] border text-sm font-medium cursor-pointer self-start px-4"
        style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
      >
        Réessayer
      </button>
    </div>
  );
}
