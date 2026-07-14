import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// "prepare: false" is MANDATORY for Supabase's Transaction Pooler
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });