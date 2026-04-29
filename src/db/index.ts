import "dotenv/config";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import * as categories from "./schema/categories";
import * as cocktailStyles from "./schema/cocktailStyles";
import * as glassware from "./schema/glassware";
import * as ingredients from "./schema/ingredients";
import * as organisations from "./schema/organisations";
import * as preparationMethods from "./schema/preparationMethods";
import * as recipeFavorites from "./schema/recipeFavorites";
import * as recipeListEntries from "./schema/recipeListEntries";
import * as recipeLists from "./schema/recipeLists";
import * as recipes from "./schema/recipes";
import * as recipeTags from "./schema/recipeTags";
import * as specs from "./schema/specs";
import * as tags from "./schema/tags";
import * as units from "./schema/units";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const schema = {
	...categories,
	...cocktailStyles,
	...glassware,
	...ingredients,
	...organisations,
	...preparationMethods,
	...recipeFavorites,
	...recipeListEntries,
	...recipeLists,
	...recipes,
	...recipeTags,
	...specs,
	...tags,
	...units,
};

const onVercel = process.env.VERCEL === "1";

const db = onVercel
	? drizzleNeon(process.env.DATABASE_URL, { schema })
	: drizzlePostgres(process.env.DATABASE_URL, { schema });

export { db };

export type DatabaseTransaction = Parameters<
	Parameters<typeof db.transaction>[0]
>[0];
