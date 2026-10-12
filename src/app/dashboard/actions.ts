"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "entreprise";
}

function extractFields(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  return {
    statut_juridique: get("statut_juridique"),
    nom_entreprise: get("nom_entreprise"),
    adresse_entreprise: get("adresse_entreprise"),
    code_ape: get("code_ape"),
    siren: get("siren"),
    siret: get("siret"),
    tva_intra: get("tva_intra"),
    adresse_facturation_electronique: get("adresse_facturation_electronique"),
    gerant: get("gerant"),
  };
}

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/login");

  const fields = extractFields(formData);
  const base = slugify(fields.nom_entreprise);
  let slug = base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("companies")
      .insert({ ...fields, slug, owner_id: user.id })
      .select("id")
      .single();

    if (!error) {
      revalidatePath("/dashboard");
      redirect(`/dashboard/${data.id}`);
    }

    if (error.code === "23505") {
      // Slug déjà pris : on en essaie un autre.
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }

    throw new Error(error.message);
  }

  throw new Error("Impossible de créer la carte : trop de tentatives sur le slug.");
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/login");

  const fields = extractFields(formData);
  const { error } = await supabase
    .from("companies")
    .update(fields)
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}

export async function deleteCompany(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/login");

  await supabase.from("companies").delete().eq("id", id).eq("owner_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
