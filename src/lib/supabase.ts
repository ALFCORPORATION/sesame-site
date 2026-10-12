import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variables d'environnement Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies."
  );
}

// Clé publique (anon / publishable) : sûre à exposer côté client, la
// sécurité réelle est assurée par les policies RLS côté Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  owner_id: string;
  slug: string;
  statut_juridique: string;
  nom_entreprise: string;
  adresse_entreprise: string;
  code_ape: string;
  siren: string;
  siret: string;
  tva_intra: string;
  adresse_facturation_electronique: string;
  gerant: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};
