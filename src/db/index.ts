import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const onVercel = process.env.VERCEL === "1";

const db = onVercel
	? drizzleNeon(neon(process.env.DATABASE_URL))
	: drizzle(process.env.DATABASE_URL);

export { db };
