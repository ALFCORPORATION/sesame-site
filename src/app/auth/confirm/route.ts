import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Lien cliqué dans l'e-mail (confirmation d'inscription, réinitialisation de
 * mot de passe…) : échange le token_hash contre une session, posée en cookie
 * côté serveur, puis redirige vers l'application.
 *
 * Nécessite que le modèle d'e-mail Supabase pointe vers cette route avec un
 * token_hash plutôt que vers {{ .ConfirmationURL }} par défaut — voir
 * Authentication > Email Templates dans le dashboard Supabase.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.search = "";
  redirectTo.searchParams.set("error", "confirmation");
  return NextResponse.redirect(redirectTo);
}
