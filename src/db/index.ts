import "dotenv/config";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import * as categories from "./schema/categories";
import * as cocktailStyles from "./schema/cocktailStyles";
import * as glassware from "./schema/glassware";
import * as ingredients from "./schema/ingredients";
import * as organisations from "./schema/organisations";
import * as preparationMethods from "./schema/preparationMethods";
import * as recipes from "./schema/recipes";
import * as specs from "./schema/specs";
import * as units from "./schema/units";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const schema = {
	...categories,
	...cocktailStyles,
	...ingredients,
	...organisations,
	...preparationMethods,
	...glassware,
	...recipes,
	...specs,
	...units,
};

const onVercel = process.env.VERCEL === "1";

const db = onVercel
	? drizzleNeon(process.env.DATABASE_URL, { schema })
	: drizzlePostgres(process.env.DATABASE_URL, { schema });

export { db };
