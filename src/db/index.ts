import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/node-postgres";
import * as categories from "./schema/categories";
import * as ingredients from "./schema/ingredients";
import * as preparationMethods from "./schema/preparationMethods";
import * as recipes from "./schema/recipes";
import * as specs from "./schema/specs";
import * as units from "./schema/units";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const schema = {
	...categories,
	...ingredients,
	...preparationMethods,
	...recipes,
	...specs,
	...units,
};

const onVercel = process.env.VERCEL === "1";

const db = onVercel
	? drizzleNeon(neon(process.env.DATABASE_URL), { schema })
	: drizzle(process.env.DATABASE_URL, { schema });

export { db };
