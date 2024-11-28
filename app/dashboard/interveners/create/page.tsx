'use client';
import { Intervenant } from '@/app/lib/definitions/Intervenant';
import CreateIntervenantForm from '@/app/ui/dashboard/CreateIntervenantForm';
import React, { use, useState } from 'react';

const CreateIntervenerPage: React.FC = () => {
    const [intervenants, setIntervenants] = useState<Intervenant[]>([]);

  const handleCreate = (newIntervenant: Intervenant) => {
    setIntervenants((prevIntervenants) => [...prevIntervenants, newIntervenant]);
  };

    return (
        <div>
            <h1>Create Intervenant</h1>
            <CreateIntervenantForm onCreate={handleCreate} />
        </div>
    );
};

export default CreateIntervenerPage;