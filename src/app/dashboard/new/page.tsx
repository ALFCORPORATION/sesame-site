import { CompanyForm } from "@/components/CompanyForm";
import { createCompany } from "../actions";

export default function NewCompanyPage() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <h1 className="font-display font-semibold text-2xl m-0 self-start max-w-lg w-full">
        Nouvelle carte
      </h1>
      <CompanyForm action={createCompany} submitLabel="Créer la carte" />
    </div>
  );
}
