import { drizzle } from "drizzle-orm/neon-http"; // ✅ use neon-http for neon()
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL); // sql is a query function
export const db = drizzle(sql, { schema }); // ✅ works now
