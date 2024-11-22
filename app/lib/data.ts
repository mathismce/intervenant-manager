'use server';
import { db } from "./db";
import { Intervenant } from "./definitions/Intervenant";

export async function fetchIntervenants(): Promise<Intervenant[]> {
    try {
        console.log("Fetching intervenants");
        const client = await db.connect();
        console.log("Connection to the database");
        const result = await client.query('SELECT * FROM "Intervenants"');
        client.release();
        return result.rows as Intervenant[];
    } catch (e : any) {
        console.error("Error de recuperation des intervenants", e);
        throw e;
    }
}