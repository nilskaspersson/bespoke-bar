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
import { preparationMethodEnum } from "@/db/schema/preparationMethods";
import {
	type DraftSpecWithDraftIngredient,
	SpecsTable,
	type SpecWithIngredient,
} from "@/db/schema/specs";
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
		archivedBy: text("archived_by"),
		archivedAt: timestamp("archived_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		createdBy: text("created_by").notNull(),
		updatedAt: timestamp("updated_at"),
		updatedBy: text("updated_by"),
		orgId: text("org_id").notNull(),
	},
	(table) => [
		index("idx_recipes_org").on(table.orgId, table.createdAt.desc()),
		index("idx_recipes_org_archived_created").on(
			table.orgId,
			table.archivedAt,
			table.createdAt.desc(),
		),
	],
);

export const recipesRelations = relations(RecipesTable, ({ many }) => ({
	specs: many(SpecsTable),
}));

export type Recipe = typeof RecipesTable.$inferSelect;

export type RecipeWithSpecs = Recipe & {
	specs: SpecWithIngredient[];
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
