'use client';

import { useState } from 'react';
import { Intervenant } from '../../lib/definitions/Intervenant'; 
import { updateIntervenant } from '../../lib/data';

type EditIntervenantFormProps = {
  intervenant: Intervenant;
};

export default function EditIntervenantForm({ intervenant }: EditIntervenantFormProps) {
  const [formData, setFormData] = useState({
    firstname: intervenant.firstname,
    lastname: intervenant.lastname,
    email: intervenant.email
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateIntervenant(intervenant.id, formData);
      window.location.href = '/dashboard/interveners';
    } catch (error) {
      console.error('Error updating intervenant:', error);
      alert('Failed to update intervenant');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="firstname" className="mb-2 block text-sm font-medium">
            Prénom
          </label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            value={formData.firstname}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastname" className="mb-2 block text-sm font-medium">
            Nom
          </label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            value={formData.lastname}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Enregistrer les modifications
        </button>
      </div>
    </form>
  );
}
