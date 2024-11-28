'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Intervenant } from '../../lib/definitions/Intervenant'; // Adjust the import path as needed
import { createIntervenant } from '../../lib/data'; // Adjust the import path as needed
import { start } from 'repl';


type CreateIntervenantFormProps = {
  onCreate: (intervenant: Intervenant) => void;
};

export default function CreateIntervenantForm({ onCreate }: CreateIntervenantFormProps) {

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
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
      const newIntervenant = await createIntervenant(formData);
      onCreate(newIntervenant);
      window.location.href = '/dashboard/interveners';
    } catch (error) {
      console.error('Error creating intervenant:', error);
      alert('Failed to create intervenant');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* First Name */}
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
            required
          />
        </div>

        {/* Last Name */}
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
            required
          />
        </div>

        {/* Email */}
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
            required
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/intervenants"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <button type="submit">Create Intervenant</button>
      </div>
    </form>
  );
}