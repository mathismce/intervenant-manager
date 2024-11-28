import Link from 'next/link';
import Image from 'next/image';
import { Intervenant } from '../../lib/definitions/Intervenant'; // Adjust the import path as needed
import { deleteIntervenant } from '../../lib/data'; // Adjust the import path as needed

type IntervenantsTableProps = {
  intervenants: Intervenant[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void; // Add onDelete prop
};

export default function IntervenantsTable({
  intervenants,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
}: IntervenantsTableProps) {
  const handleDelete = async (id: number) => {
    if (confirm('Es-tu sur de vouloir supprimer cet intervenant ?')) {
      try {
        await deleteIntervenant(id);
        onDelete(id); // Call onDelete to update the state
      } catch (error) {
        console.error('Error deleting intervenant:', error);
        alert('Failed to delete intervenant');
      }
    }
  };

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
                  <td className=" ">
                    <div className="flex justify-center gap-5">
                      <Link href={`/dashboard/interveners/${intervenant.id}/edit`}>
                        <Image src={'/edit.svg'} alt='edition' width={16} height={18} />
                      </Link>
                      <button onClick={() => handleDelete(intervenant.id)} className="text-red-600 hover:text-red-900">
                      <Image src={'/delete.svg'} alt='edition' width={14} height={16} />
                      </button>
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
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}