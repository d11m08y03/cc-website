import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/postgres/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.AUTH_DRIZZLE_PG!,
  },
});
