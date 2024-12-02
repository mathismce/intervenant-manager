import { updateAllIntervenantKeys } from "@/app/lib/data";
import Link from "next/link";

export function CreateIntervener() {
    return (
      <Link
        href="/dashboard/interveners/create"
        className="flex h-10 items-center rounded-lg bg-rose-800 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      >
        <span className="hidden md:block">Ajouter un intervenant</span>{' '}
      </Link>
    );
  }

export function RegenerateAllKeys() {
      const handleRegenerateKey = async () => {
        try {
          await updateAllIntervenantKeys();
          window.location.reload();
        } catch (error) {
          console.error('Error regenerating keys:', error);
          alert('Une erreur est survenue lors de la regénération des clés');
        }

  }

  return (
    <button
        onClick={handleRegenerateKey}
        className="flex h-10 items-center rounded-lg bg-rose-800 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
    >
        Regenerer toutes les clés
    </button>
);
}
  