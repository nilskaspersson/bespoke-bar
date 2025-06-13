import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	pgTable,
	real,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod/v4";
import { systemCategoryEnum } from "@/db/schema/categories";
import { SpecsTable } from "@/db/schema/specs";
import { measurementTypes } from "@/db/schema/units";

export const IngredientsTable = pgTable(
	"ingredients",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		name: varchar("name", { length: 100 }).notNull(),
		category: systemCategoryEnum("category"),
		abv: real("abv"),
		brand: varchar("brand", { length: 100 }),
		price: real("price"),
		measurementType: measurementTypes("measurementType"),
		orgId: text("org_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
		createdBy: text("created_by").notNull(),
		updatedBy: text("updated_by"),
	},
	(table) => [
		unique("unique_name").on(table.name, table.orgId),
		check(
			"abv_valid_range",
			sql`${table.abv} IS NULL OR (${table.abv} >= 0 AND ${table.abv} <= 1)`,
		),
		check("price_positive", sql`${table.price} IS NULL OR ${table.price} > 0`),
		check(
			"price_requires_measurement_type",
			sql`${table.price} IS NULL OR ${table.measurementType} IS NOT NULL`,
		),
		index("idx_ingredients_org").on(table.orgId),
	],
);

export const ingredientsRelations = relations(IngredientsTable, ({ many }) => ({
	specs: many(SpecsTable),
}));

export type Ingredient = typeof IngredientsTable.$inferSelect;

export type InsertIngredient = Omit<
	typeof IngredientsTable.$inferInsert,
	"id" | "createdAt" | "updatedAt"
>;

const ingredientsConstraintsSchema = {
	abv: z.coerce.number().min(0).max(100).nullable(),
	price: z.coerce.number().positive().nullable(),
};

type IngredientRefinementInput = Partial<
	Pick<
		z.input<ReturnType<typeof createInsertSchema<typeof IngredientsTable>>>,
		"price" | "measurementType"
	>
>;

const ingredientsRefinements: [
	(data: IngredientRefinementInput) => boolean,
	{ message: string; path: string[] },
] = [
	(data) => data.price == null || data.measurementType != null,
	{
		message: "Measurement type is required when price is provided",
		path: ["measurementType"],
	},
];

export const selectIngredientSchema = createSelectSchema(IngredientsTable);

export const insertIngredientSchema = createInsertSchema(IngredientsTable)
	.extend(ingredientsConstraintsSchema)
	.refine(...ingredientsRefinements);

export const draftIngredientSchema = createInsertSchema(IngredientsTable)
	.omit({
		orgId: true,
		createdBy: true,
		updatedBy: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend(ingredientsConstraintsSchema)
	.refine(...ingredientsRefinements);

export const updateIngredientSchema = createUpdateSchema(IngredientsTable)
	.extend(ingredientsConstraintsSchema)
	.refine(...ingredientsRefinements);

/**
 * The fields users can provide to create an ingredient.
 */
export type DraftIngredient = z.infer<typeof draftIngredientSchema>;
