import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "var(--paper)" }}
    >
      <Suspense fallback={<AuthForm mode="login" />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError =
    error === "confirmation"
      ? "Ce lien de confirmation n'est plus valide. Réessayez de vous inscrire, ou connectez-vous si votre compte est déjà confirmé."
      : undefined;
  return <AuthForm mode="login" initialError={initialError} />;
}
