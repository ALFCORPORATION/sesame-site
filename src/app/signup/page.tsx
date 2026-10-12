import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "var(--paper)" }}
    >
      <AuthForm mode="signup" />
    </main>
  );
}
