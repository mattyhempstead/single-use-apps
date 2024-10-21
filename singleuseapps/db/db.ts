import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config();

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  // I kept getting "max connections reached" error in dev mode (possibly in prod unsure).
  // My theory is that the hotreloading was causing new connections to stack up.
  // Not sure if this will fix it but we will see.
  idle_timeout: 10,
});
export const db = drizzle(client, { schema });
