import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	pgTable,
	real,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { systemCategories, systemCategoryEnum } from "@/db/schema/categories";
import { SpecsTable } from "@/db/schema/specs";
import { measurementTypes, supportedMeasurements } from "@/db/schema/units";
import { sqlNormalizedString } from "@/db/utils";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";
import { nullifyEmptyField } from "@/utils/form";

export const IngredientsTable = pgTable(
	"ingredients",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 5000 }),
		category: systemCategoryEnum("category"),
		abv: real("abv"),
		brand: varchar("brand", { length: 100 }),
		unitCost: real("unitCost"),
		measurementType: measurementTypes("measurementType"),
		orgId: text("org_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
		createdBy: text("created_by").notNull(),
		updatedBy: text("updated_by"),
		aiEnrichedFields: text("ai_enriched_fields").array(),
	},
	(table) => [
		uniqueIndex("unique_ingredient_name_case_insensitive").on(
			sqlNormalizedString(table.name),
			table.orgId,
		),
		check(
			"abv_valid_range",
			sql`${table.abv} IS NULL OR (${table.abv} >= 0 AND ${table.abv} <= 1)`,
		),
		check("cost_positive", sql`${table.unitCost} IS NULL OR ${table.unitCost} > 0`),
		check(
			"cost_requires_measurement_type",
			sql`${table.unitCost} IS NULL OR ${table.measurementType} IS NOT NULL`,
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

/**
 * System fields excluded from user-facing schemas (draft/form).
 */
const INGREDIENT_SYSTEM_FIELDS = {
	id: true,
	orgId: true,
	createdBy: true,
	updatedBy: true,
	createdAt: true,
	updatedAt: true,
	aiEnrichedFields: true,
} as const;

/**
 * API/DB constraints — clean types, no coercion.
 * Used by tRPC input validation and service-layer DB validation.
 */
const ingredientConstraints = {
	name: z
		.string("Name is required")
		.min(1, "Name is required")
		.max(100, "Name must be 100 characters or less"),
	category: systemCategories.nullish(),
	abv: z.number().min(0).max(1).nullish(),
	brand: z.string().nullish(),
	unitCost: z
		.number({ message: "Cost must be a number" })
		.positive("Cost must be positive")
		.nullish(),
	measurementType: supportedMeasurements.nullish(),
};

/**
 * Form constraints — coercion transforms for FormData (strings → proper types).
 * Same output types as ingredientConstraints.
 */
const ingredientFormConstraints = {
	name: z
		.string("Name is required")
		.min(1, "Name is required")
		.max(100, "Name must be 100 characters or less"),
	category: z.preprocess(nullifyEmptyField, systemCategories.nullable()).optional(),
	abv: percentageToRatioSchema.optional(),
	brand: z.preprocess(nullifyEmptyField, z.string().nullable()).optional(),
	unitCost: z
		.preprocess(
			nullifyEmptyField,
			z.coerce
				.number({ message: "Cost must be a number" })
				.positive("Cost must be positive")
				.nullable(),
		)
		.optional(),
	measurementType: z.preprocess(nullifyEmptyField, supportedMeasurements.nullable()).optional(),
};

function refineIngredient<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
	return schema.refine(
		(data: z.output<T>) => data.unitCost == null || data.measurementType != null,
		{
			message: "Measurement type is required when unitCost is provided",
			path: ["measurementType"],
		},
	);
}

export const selectIngredientSchema = createSelectSchema(IngredientsTable);

/**
 * Shared base shapes — each schema = base × constraints, then refined.
 */
const insertBase = createInsertSchema(IngredientsTable);
const draftBase = insertBase.omit(INGREDIENT_SYSTEM_FIELDS);
const updateBase = createUpdateSchema(IngredientsTable);

/** DB insert schema */
export const insertIngredientSchema = refineIngredient(insertBase.extend(ingredientConstraints));

/** API schema */
export const draftIngredientSchema = refineIngredient(draftBase.extend(ingredientConstraints));
export const updateIngredientSchema = refineIngredient(updateBase.extend(ingredientConstraints));

/** Form schema */
export const draftIngredientFormSchema = refineIngredient(
	draftBase.extend(ingredientFormConstraints),
);
export const updateIngredientFormSchema = refineIngredient(
	updateBase.extend(ingredientFormConstraints),
);

/**
 * The fields users can provide to create an ingredient.
 */
export type DraftIngredient = z.infer<typeof draftIngredientSchema>;
