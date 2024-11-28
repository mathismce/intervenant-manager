'use client';

import { useEffect, useState } from 'react';
import { fetchIntervenants } from '../../lib/data'; // Adjust the import path as needed
import { Intervenant } from '../../lib/definitions/Intervenant'; // Adjust the import path as needed
import IntervenantsTable from '../../ui/dashboard/IntervenantsTable'; // Adjust the import path as needed
import { CreateIntervener } from '@/app/ui/dashboard/intervener/button';

export default function IntervenerPage() {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchIntervenants(currentPage)
      .then((data) => {
        console.log('Fetched data:', data); // Log the fetched data to the console
        setIntervenants(data.intervenants);
        setTotalPages(data.totalPages);
      })
      .catch((e) => {
        console.error('Error fetching intervenants:', e);
        setError(e.message);
      });
  }, [currentPage]);

  const handleDelete = (id: number) => {
    setIntervenants((prevIntervenants) => prevIntervenants.filter((intervenant) => intervenant.id !== id));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className='flex justify-between'>
        <h1>Liste des Intervenants</h1>
        <CreateIntervener></CreateIntervener>
      </div>
      <IntervenantsTable
        intervenants={intervenants}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onDelete={handleDelete}
      />
    </div>
  );
}