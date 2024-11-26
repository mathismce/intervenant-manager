'use client';

import { useEffect, useState } from 'react';
import { fetchIntervenants } from '../../lib/data'; // Adjust the import path as needed
import { Intervenant } from '../../lib/definitions/Intervenant'; // Adjust the import path as needed
import IntervenantsTable from '../../ui/dashboard/IntervenantsTable'; // Adjust the import path as needed

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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Liste des Intervenants</h1>
      <IntervenantsTable
        intervenants={intervenants}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}