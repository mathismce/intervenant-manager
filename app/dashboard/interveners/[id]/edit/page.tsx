'use client';

import { useEffect, useState } from 'react';
import { fetchIntervenant } from '@/app/lib/data'; // Adjust the import path as needed

import { Intervenant } from '@/app/lib/definitions/Intervenant'; // Adjust the import path as needed
import EditIntervenantForm from '@/app/ui/dashboard/EditIntervenantForm'; // Adjust the import path as needed

export default function EditIntervenantPage({ params }: { params: { id: Number } }) {
    const id = params.id;
  const [intervenant, setIntervenant] = useState<Intervenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log('id:', id);

  useEffect(() => {
    fetchIntervenant(Number(id))
      .then((data) => {
        console.log(id);
        console.log('Fetched intervenant:', data); 
        setIntervenant(data);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!intervenant) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Intervenant</h1>
      <EditIntervenantForm intervenant={intervenant} />
    </div>
  );
}