'use client';
import { useEffect, useState } from 'react';
import { fetchIntervenants } from '../../lib/data'; // Adjust the import path as needed
import { Intervenant } from '../../lib/definitions/Intervenant'; // Adjust the import path as needed

export default function IntervenerPage() {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect triggered');
    fetchIntervenants()
      .then((data) => {
        console.log('Fetched data:', data); // Log the fetched data to the console
        setIntervenants(data);
      })
      .catch((e) => {
        console.error('Error fetching intervenants:', e);
        setError(e.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Intervener</h1>
      <p>Intervener page content</p>
      <ul>
        {intervenants.map((intervenant) => (
          <li key={intervenant.id}>{intervenant.email}</li>
        ))}
      </ul>
    </div>
  );
}