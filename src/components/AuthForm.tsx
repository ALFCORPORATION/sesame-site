"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({
  mode,
  initialError,
}: {
  mode: "login" | "signup";
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(traduireErreur(error.message));
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setInfo("Compte créé : vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(traduireErreur(error.message));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm flex flex-col gap-4 rounded-[20px] border p-8"
      style={{ borderColor: "var(--line)", background: "var(--paper-raised)" }}
    >
      <h1 className="font-display font-semibold text-2xl m-0 mb-1">
        {mode === "signup" ? "Créer un compte" : "Se connecter"}
      </h1>

      <label className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
        E-mail
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[9px] border px-3 py-2 text-[0.95rem]"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
        Mot de passe
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[9px] border px-3 py-2 text-[0.95rem]"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        />
      </label>

      {error && <p className="text-sm m-0" style={{ color: "var(--danger)" }}>{error}</p>}
      {info && <p className="text-sm m-0" style={{ color: "var(--success)" }}>{info}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-[11px] font-medium text-[0.92rem] mt-1 cursor-pointer disabled:opacity-60"
        style={{ background: "var(--brass)", color: "var(--paper-raised)" }}
      >
        {loading ? "…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
      </button>

      <p className="text-sm text-center m-0 mt-1" style={{ color: "var(--ink-faint)" }}>
        {mode === "signup" ? (
          <>Déjà un compte ? <a href="/login" className="underline" style={{ color: "var(--brass)" }}>Se connecter</a></>
        ) : (
          <>Pas encore de compte ? <a href="/signup" className="underline" style={{ color: "var(--brass)" }}>S&apos;inscrire</a></>
        )}
      </p>
    </form>
  );
}

function traduireErreur(message: string): string {
  if (message.includes("Invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (message.includes("already registered") || message.includes("already exists")) return "Un compte existe déjà avec cet e-mail.";
  if (message.includes("Password should be at least")) return "Le mot de passe doit contenir au moins 6 caractères.";
  return message;
}
