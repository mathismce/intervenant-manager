'use server';
import { db } from './db';
import { Intervenant } from './definitions/Intervenant'; // Adjust the import path as needed

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
        SET firstname = $1, lastname = $2, email = $3, creationdate = $4, enddate = $5
        WHERE id = $6
      `;
      const values = [data.firstname, data.lastname, data.email, data.startDate, data.endDate, id];
      await client.query(query, values);
      client.release();
    } catch (error) {
      console.error('Error updating intervenant:', error);
      throw error;
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