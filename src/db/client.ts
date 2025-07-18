import "dotenv/config";
import pkg from "pg"; // node-postgres
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./postgres/schema";

const { Pool } = pkg;

// Create pg Pool with your environment connection string
const pool = new Pool({
  connectionString: process.env.AUTH_DRIZZLE_PG!,
  // other optional config
});

export const db = drizzle(pool, { schema });
