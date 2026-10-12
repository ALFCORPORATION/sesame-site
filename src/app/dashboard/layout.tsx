import Link from "next/link";
import { signOut } from "./actions";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <Link href="/dashboard" className="font-display italic font-medium" style={{ color: "var(--brass)" }}>
          Sésame
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm cursor-pointer underline"
            style={{ color: "var(--ink-faint)" }}
          >
            Se déconnecter
          </button>
        </form>
      </header>
      <main className="flex-1 flex flex-col items-center px-4 py-10">{children}</main>
    </div>
  );
}
