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
