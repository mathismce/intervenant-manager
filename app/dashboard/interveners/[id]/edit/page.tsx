'use client';

import { useEffect, useState } from 'react';
import { Intervenant } from '@/app/lib/definitions/Intervenant';
import EditIntervenantForm from '@/app/ui/dashboard/EditIntervenantForm';
import { fetchIntervenant } from '@/app/lib/data';
import React from 'react';

export default function EditIntervenantPage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = React.use(params); // Utilise use() pour extraire `id` correctement
  const [intervenant, setIntervenant] = useState<Intervenant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchIntervenant(id);
        setIntervenant(data);
      } catch (err) {
        setError('Failed to fetch intervenant data');
      }
    }
    fetchData();
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
