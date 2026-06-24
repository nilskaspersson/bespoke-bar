import { relations, sql } from "drizzle-orm";
import {
	doublePrecision,
	index,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { Identity, Keyed } from "../types";
import { cocktailStylesEnum } from "./cocktailStyles";
import { createdAtCol, nanoidPk, orgIdCascade } from "./columns";
import { glasswareEnum } from "./glassware";
import { iceEnum } from "./ice";
import {
	type DraftIngredientLineWithDraftIngredient,
	type IngredientLine,
	IngredientLinesTable,
	type IngredientLineWithIngredient,
} from "./ingredientLines";
import { preparationMethodEnum } from "./preparationMethods";
import { RecipeFavoritesTable } from "./recipeFavorites";
import { type RecipeTag, RecipeTagsTable } from "./recipeTags";
import type { Tag } from "./tags";

export const RecipesTable = pgTable(
	"recipes",
	{
		id: nanoidPk(),
		name: varchar("name", { length: 100 }),
		description: varchar("description", { length: 5000 }),
		instructions: varchar("instructions", { length: 5000 }),
		preparationMethod: preparationMethodEnum("preparation_method"),
		dilutionTarget: doublePrecision("dilution_target"),
		glassware: glasswareEnum("glassware"),
		ice: iceEnum("ice"),
		garnish: varchar("garnish", { length: 100 }),
		style: cocktailStylesEnum("style"),
		aiEnrichedFields: text("ai_enriched_fields").array(),
		createdAt: createdAtCol(),
		createdBy: text("created_by").notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		updatedBy: text("updated_by"),
		orgId: orgIdCascade(),
	},
	(table) => [
		index("idx_recipes_org_created").on(
			table.orgId,
			sql`${table.createdAt} DESC`,
		),
	],
);

export const recipesRelations = relations(RecipesTable, ({ many }) => ({
	lines: many(IngredientLinesTable),
	favorites: many(RecipeFavoritesTable),
	tags: many(RecipeTagsTable),
}));

export type Recipe = typeof RecipesTable.$inferSelect;

export type RecipeWithLines<
	S extends IngredientLine = IngredientLineWithIngredient,
> = Recipe & {
	lines: S[];
};

export type RecipeTagWithTag = RecipeTag & { tag: Tag };

export type RecipeWithRelations<
	S extends IngredientLine = IngredientLineWithIngredient,
	T extends RecipeTag = RecipeTagWithTag,
> = RecipeWithLines<S> & {
	tags: T[];
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
			| "aiEnrichedFields"
			| "description"
			| "dilutionTarget"
			| "garnish"
			| "glassware"
			| "ice"
			| "instructions"
			| "name"
			| "preparationMethod"
			| "style"
		>
	> & {
		lines?: Keyed<DraftIngredientLineWithDraftIngredient>[];
	}
>;

export const selectRecipeSchema = createSelectSchema(RecipesTable);
export const insertRecipeSchema = createInsertSchema(RecipesTable);
/** `aiEnrichedFields` is server-owned (set by Enrichment, recomputed on edit) — never client-submittable. */
export const updateRecipeSchema = createUpdateSchema(RecipesTable).omit({
	aiEnrichedFields: true,
});
