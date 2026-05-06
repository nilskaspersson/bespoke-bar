import { relations } from "drizzle-orm";
import {
	index,
	pgTable,
	real,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { nanoid } from "nanoid";
import { cocktailStylesEnum } from "@/db/schema/cocktailStyles";
import { glasswareEnum } from "@/db/schema/glassware";
import { OrganisationsTable } from "@/db/schema/organisations";
import { preparationMethodEnum } from "@/db/schema/preparationMethods";
import { RecipeFavoritesTable } from "@/db/schema/recipeFavorites";
import { type RecipeTag, RecipeTagsTable } from "@/db/schema/recipeTags";
import {
	type DraftSpecWithDraftIngredient,
	SpecsTable,
	type SpecWithIngredient,
} from "@/db/schema/specs";
import type { Tag } from "@/db/schema/tags";
import type { Identity } from "@/utils/types";
import type { Keyed } from "@/utils/withKey";

export const RecipesTable = pgTable(
	"recipes",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		name: varchar("name", { length: 100 }),
		description: varchar("description", { length: 5000 }),
		instructions: varchar("instructions", { length: 5000 }),
		preparationMethod: preparationMethodEnum("preparation_method"),
		dilutionTarget: real("dilution_target"),
		glassware: glasswareEnum("glassware"),
		garnish: varchar("garnish", { length: 100 }),
		style: cocktailStylesEnum("style"),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		createdBy: text("created_by").notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		updatedBy: text("updated_by"),
		orgId: text("org_id")
			.notNull()
			.references(() => OrganisationsTable.id, { onDelete: "cascade" }),
	},
	(table) => [index("idx_recipes_org_id").on(table.orgId)],
);

export const recipesRelations = relations(RecipesTable, ({ many }) => ({
	specs: many(SpecsTable),
	favorites: many(RecipeFavoritesTable),
	tags: many(RecipeTagsTable),
}));

export type Recipe = typeof RecipesTable.$inferSelect;

export type RecipeWithSpecs = Recipe & {
	specs: SpecWithIngredient[];
};

export type RecipeTagWithTag = RecipeTag & { tag: Tag };

export type RecipeWithRelations = RecipeWithSpecs & {
	tags: RecipeTagWithTag[];
};

export type InsertRecipe = Omit<
	typeof RecipesTable.$inferInsert,
	"id" | "createdAt" | "updatedAt" | "createdBy" | "orgId"
>;

/**
 * Baseline Recipe structure for component generics to extend. Can be a draft, can
 * be a db entity.
 */
export type BaseRecipe = Identity<
	Partial<
		Pick<
			Recipe,
			| "id"
			| "description"
			| "dilutionTarget"
			| "garnish"
			| "glassware"
			| "instructions"
			| "name"
			| "preparationMethod"
			| "style"
		>
	> & {
		specs?: Keyed<DraftSpecWithDraftIngredient>[];
	}
>;

export const selectRecipeSchema = createSelectSchema(RecipesTable);
export const insertRecipeSchema = createInsertSchema(RecipesTable);
export const updateRecipeSchema = createUpdateSchema(RecipesTable);
