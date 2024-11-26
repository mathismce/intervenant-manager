import Image from 'next/image';
import { Intervenant } from '../../lib/definitions/Intervenant'; // Adjust the import path as needed
import { useState } from 'react';
import Link from 'next/link';


type IntervenantsTableProps = {
  intervenants: Intervenant[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function IntervenantsTable({
  intervenants,
  currentPage,
  totalPages,
  onPageChange,
}: IntervenantsTableProps) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Prénom
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Nom
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date de début
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date de fin
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Clé
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {intervenants.map((intervenant) => (
                <tr
                  key={intervenant.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{intervenant.firstname}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {intervenant.lastname}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {intervenant.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(intervenant.creationdate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(intervenant.enddate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {intervenant.key}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/dashboard/interveners/${intervenant.id}/edit` }>
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span>
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}