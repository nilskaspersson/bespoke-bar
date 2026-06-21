import "dotenv/config";
import * as categories from "@bespoke/schema/schema/categories";
import * as cocktailStyles from "@bespoke/schema/schema/cocktailStyles";
import * as glassware from "@bespoke/schema/schema/glassware";
import * as ingredientLines from "@bespoke/schema/schema/ingredientLines";
import * as ingredients from "@bespoke/schema/schema/ingredients";
import * as menuEntries from "@bespoke/schema/schema/menuEntries";
import * as menus from "@bespoke/schema/schema/menus";
import * as ocrQuotaGrants from "@bespoke/schema/schema/ocrQuotaGrants";
import * as ocrQuotaUses from "@bespoke/schema/schema/ocrQuotaUses";
import * as organisations from "@bespoke/schema/schema/organisations";
import * as orgSubscriptions from "@bespoke/schema/schema/orgSubscriptions";
import * as preparationMethods from "@bespoke/schema/schema/preparationMethods";
import * as recipeFavorites from "@bespoke/schema/schema/recipeFavorites";
import * as recipeSlotGrants from "@bespoke/schema/schema/recipeSlotGrants";
import * as recipes from "@bespoke/schema/schema/recipes";
import * as recipeTags from "@bespoke/schema/schema/recipeTags";
import * as tags from "@bespoke/schema/schema/tags";
import * as units from "@bespoke/schema/schema/units";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const schema = {
	...categories,
	...cocktailStyles,
	...glassware,
	...ingredients,
	...menuEntries,
	...menus,
	...ocrQuotaGrants,
	...ocrQuotaUses,
	...organisations,
	...orgSubscriptions,
	...preparationMethods,
	...recipeFavorites,
	...recipes,
	...recipeSlotGrants,
	...recipeTags,
	...ingredientLines,
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

/** Accepts either the pooled `db` or a transaction handle, for queries shared between the two. */
export type DatabaseExecutor = typeof db | DatabaseTransaction;
