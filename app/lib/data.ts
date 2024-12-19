'use server';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { Intervenant } from './definitions/Intervenant'; // Adjust the import path as needed
import { revalidatePath } from 'next/cache';


import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
 

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }


export async function fetchIntervenants(page: number = 1, limit: number = 10): Promise<{ intervenants: Intervenant[], totalPages: number }> {
    try {
        const client = await db.connect();
        const offset = (page - 1) * limit;
        const result = await client.query('SELECT * FROM "Intervenants" LIMIT $1 OFFSET $2', [limit, offset]);
        const countResult = await client.query('SELECT COUNT(*) FROM "Intervenants"');
        client.release();
        const totalCount = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalCount / limit);
        return { intervenants: result.rows as Intervenant[], totalPages };
    } catch (e: any) {
        console.error("Error de recuperation des intervenants", e);
        throw e;
    }
}

export async function updateIntervenant(id: number, data: any) {
    try {
      const client = await db.connect();
      const query = `
        UPDATE "Intervenants"
        SET firstname = $1, lastname = $2, email = $3,  enddate = $4
        WHERE id = $5
      `;
      const values = [data.firstname, data.lastname, data.email, data.enddate, id];
      await client.query(query, values);
      client.release();
    } catch (error) {
      console.error('Error updating intervenant:', error);
      throw error;
    }
  }

  export async function updateIntervenantKey(id: number) {
    const key = uuidv4();
    const creationdate = new Date().toISOString();
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);
    try {
      const client = await db.connect();
      const query = `
        UPDATE "Intervenants"
        SET key = $1, creationdate = $2, enddate = $3
        WHERE id = $4
      `;
      const values = [key, creationdate, enddate.toISOString(), id];
      await client.query(query, values);
      client.release();
      revalidatePath('/dashboard/interveners');
      return {message: 'Clé regenerée'};
    } catch (error) {
      console.error('Error updating intervenant:', error);
      throw error;
    }
  }

  export async function updateAllIntervenantKeys() {
    const key = uuidv4();
    const creationdate = new Date().toISOString();
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);
    try {
      const client = await db.connect();
      const query = `
        UPDATE "Intervenants"
        SET key = $1, creationdate = $2, enddate = $3
      `;
      const values = [key, creationdate, enddate.toISOString()];
      await client.query(query, values);
      client.release();
      revalidatePath('/dashboard/interveners');
      return {message: 'Clés regenerées pour tous les intervenants'};
    } catch (error) {
      console.error('Error updating intervenants:', error);
      throw error;
    }
}

  export async function deleteIntervenant(id: number): Promise<void> {
    try {
        const client = await db.connect();
        await client.query('DELETE FROM "Intervenants" WHERE id = $1', [id]);
        client.release();
    } catch (e: any) {
        console.error("Error deleting intervenant", e);
        throw e;
    }
}

export async function fetchIntervenant(id: number): Promise<Intervenant> {
    try {
        const client = await db.connect();
        const result = await client.query('SELECT * FROM "Intervenants" WHERE id = $1', [id]);
        client.release();
        return result.rows[0] as Intervenant;
    } catch (e: any) {
        console.error("Error fetching intervenant:", e);
        throw e;
    }
}


export async function createIntervenant(data: any): Promise<Intervenant> {
  const key = uuidv4();
  const creationdate = new Date().toISOString();
  const enddate = new Date();
  enddate.setMonth(enddate.getMonth() + 2);
  try {
    const client = await db.connect();
    const query = `
      INSERT INTO "Intervenants" (firstname, lastname, email, key, creationdate, enddate)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [data.firstname, data.lastname, data.email, key, creationdate, enddate.toISOString()];
    const result = await client.query(query, values);
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error creating intervenant:', error);
    throw error;
  }
}


export async function fetchIntervenantByKey(key: string) {
  try {
    const client = await db.connect();
    const result = await client.query(`SELECT * FROM "Intervenants" WHERE key = $1`, [key]);
    client.release();

    if (result.rows.length > 0) {
      const intervenant = result.rows[0];

      if (intervenant.enddate < new Date()) {
        throw new Error('key expired.');
      } else {
        return intervenant;
      }
    } else {
      throw new Error('Intervenant not found.');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'key expired.') {
      throw new Error('expired');
    }
    throw new Error('Database Error: Failed to find intervenant by key.');
  }
}

export async function updateAvailability(
  intervenantId: number,
  week: string,
  availabilityData: { days: string; from: string; to: string }[]
) {
  try {
    const client = await db.connect();

    // Convert availabilityData to JSON string format
    const availabilityJson = JSON.stringify(availabilityData);

    // Query to fetch existing availability for the specified week
    const fetchQuery = `
      SELECT availability
      FROM public."Intervenants"
      WHERE id = $1;
    `;

    const fetchResult = await client.query(fetchQuery, [intervenantId]);

    if (fetchResult.rows.length === 0) {
      throw new Error(`Intervenant with ID ${intervenantId} not found.`);
    }

    const existingAvailability = fetchResult.rows[0].availability || {};
    const weekPath = `{${week}}`;

    // Parse existing availability for the week
    const currentWeekData =
      existingAvailability[week] || []; // Default to empty array if no data exists

    // Merge existing data with new availabilityData
    const mergedAvailability = [
      ...currentWeekData,
      ...availabilityData,
    ];

    // Update the availability field for the specific intervenant
    const updateQuery = `
      UPDATE public."Intervenants"
      SET availability = jsonb_set(
        availability::jsonb,
        $1, -- Path to the week in the JSON
        $2::jsonb -- Merged availability data as JSON
      )
      WHERE id = $3;
    `;

    await client.query(updateQuery, [weekPath, JSON.stringify(mergedAvailability), intervenantId]);

    client.release();

    return { message: `Availability updated successfully for week ${week}` };
  } catch (error) {
    console.error("Error updating availability:", error);
    throw new Error("Failed to update availability.");
  }
}

export async function deleteEventFromAvailability(
  intervenantId: number,
  week: string,
  eventStart: string, // Remplacer eventId par eventStart (ou toute autre info pertinente)
  eventEnd: string,   // Ajoutez la date de fin si nécessaire
  eventDays: string   // Ajoutez les jours pour identifier l'événement
): Promise<void> {
  const client = await db.connect();
  try {
    // Requête pour récupérer la disponibilité actuelle
    const fetchQuery = `
        SELECT availability
        FROM public."Intervenants"
        WHERE id = $1;
    `;
    const result = await client.query(fetchQuery, [intervenantId]);
    const availability = result.rows[0]?.availability;

    if (!availability) {
      throw new Error(`No availability found for intervenant with ID ${intervenantId}`);
    }

    // Vérifier si la semaine existe dans la disponibilité
    const weekData = availability[week];
    if (!weekData) {
      throw new Error(`No availability found for week ${week}`);
    }

    // Filtrer les événements pour supprimer celui qui correspond
    const updatedWeekData = weekData.filter((event: any) => {
      return !(event.from === eventStart && event.to === eventEnd && event.days === eventDays);
    });

    // Mettre à jour la disponibilité
    const updateQuery = `
      UPDATE public."Intervenants"
      SET availability = jsonb_set(
        availability::jsonb,
        $1, -- Chemin vers la semaine
        $2::jsonb -- Données mises à jour
      )
      WHERE id = $3;
    `;
    const weekPath = `{${week}}`; // Format JSONB pour la clé de la semaine
    await client.query(updateQuery, [weekPath, JSON.stringify(updatedWeekData), intervenantId]);

    console.log(
      `Event with start: ${eventStart}, end: ${eventEnd}, days: ${eventDays} successfully deleted from week ${week} for intervenant ID ${intervenantId}`
    );
  } catch (error) {
    console.error('Error deleting event from availability:', error);
    throw new Error('Failed to delete event.');
  } finally {
    client.release(); // Assurez-vous que le client est toujours libéré
  }
}

export async function updateEventAvailability(
  intervenantId: number,
  week: string,
  eventDetails: { days: string; from: string; to: string } // Détails de l'événement à insérer
): Promise<void> {
  const client = await db.connect();
  try {
    // Requête pour récupérer la disponibilité actuelle
    const fetchQuery = `
      SELECT availability
      FROM public."Intervenants"
      WHERE id = $1;
    `;
    const result = await client.query(fetchQuery, [intervenantId]);
    const availability = result.rows[0]?.availability;

    if (!availability) {
      throw new Error(`No availability found for intervenant with ID ${intervenantId}`);
    }

    // Vérifier si la semaine existe dans la disponibilité
    const weekData = availability[week];
    if (!weekData) {
      throw new Error(`No availability found for week ${week}`);
    }

    // Ajouter un événement (ou le modifier) dans la semaine pour cet intervenant
    const updatedWeekData = [...weekData, eventDetails];

    // Mettre à jour la disponibilité de l'intervenant
    const updateQuery = `
      UPDATE public."Intervenants"
      SET availability = jsonb_set(
        availability::jsonb,
        $1, -- Chemin vers la semaine
        $2::jsonb -- Données mises à jour
      )
      WHERE id = $3;
    `;
    const weekPath = `{${week}}`; // Format JSONB pour la clé de la semaine
    await client.query(updateQuery, [weekPath, JSON.stringify(updatedWeekData), intervenantId]);

    console.log(
      `Event with days: ${eventDetails.days}, from: ${eventDetails.from}, to: ${eventDetails.to} successfully added to week ${week} for intervenant ID ${intervenantId}`
    );
  } catch (error) {
    console.error('Error updating event availability:', error);
    throw new Error('Failed to update event availability.');
  } finally {
    client.release(); // Assurez-vous que le client est toujours libéré
  }
}

export async function removeAvailability(
  intervenantId: number,
  week: string,
  availabilityToRemove: { days: string; from: string; to: string }
) {
  try {
    const client = await db.connect();

    // Query to fetch existing availability for the specified week
    const fetchQuery = `
      SELECT availability
      FROM public."Intervenants"
      WHERE id = $1;
    `;

    const fetchResult = await client.query(fetchQuery, [intervenantId]);

    if (fetchResult.rows.length === 0) {
      throw new Error(`Intervenant with ID ${intervenantId} not found.`);
    }

    const existingAvailability = fetchResult.rows[0].availability || {};
    const weekPath = `{${week}}`;

    // Parse existing availability for the week
    const currentWeekData =
      existingAvailability[week] || []; // Default to empty array if no data exists

    // Filter out the availabilityToRemove
    const updatedAvailability = currentWeekData.filter(
      (availability: { days: string; from: string; to: string }) =>
        availability.days !== availabilityToRemove.days ||
        availability.from !== availabilityToRemove.from ||
        availability.to !== availabilityToRemove.to
    );

    // Update the availability field for the specific intervenant
    const updateQuery = `
      UPDATE public."Intervenants"
      SET availability = jsonb_set(
        availability::jsonb,
        $1, -- Path to the week in the JSON
        $2::jsonb -- Updated availability data as JSON
      )
      WHERE id = $3;
    `;

    await client.query(updateQuery, [weekPath, JSON.stringify(updatedAvailability), intervenantId]);

    client.release();

    return { message: `Availability removed successfully for week ${week}` };
  } catch (error) {
    console.error("Error removing availability:", error);
    throw new Error("Failed to remove availability.");
  }
}



