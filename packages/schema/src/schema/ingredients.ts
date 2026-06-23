import { relations, sql } from "drizzle-orm";
import {
	check,
	doublePrecision,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { nullifyEmptyField } from "../form";
import { normalizeIngredientName } from "../normalizeIngredientName";
import { percentageToRatioSchema } from "../percentageToRatio";
import { systemCategories, systemCategoryEnum } from "./categories";
import { createdAtCol, nanoidPk, orgIdCascade } from "./columns";
import { IngredientLinesTable } from "./ingredientLines";
import { measurementTypes, supportedMeasurements } from "./units";

export const IngredientsTable = pgTable(
	"ingredients",
	{
		id: nanoidPk(),
		name: varchar("name", { length: 100 }).notNull(),
		/**
		 * App-owned canonical form of `name` ({@link normalizeIngredientName}) — the
		 * identity key the unique index compares directly. The app is the sole writer
		 * (via the insert schema's transform and the update service); the DB enforces
		 * uniqueness on it. NOT NULL: added nullable in 0028 to land on a populated
		 * table, backfilled in 0029, then constrained.
		 */
		normalizedName: text("normalized_name").notNull(),
		description: varchar("description", { length: 5000 }),
		category: systemCategoryEnum("category"),
		abv: doublePrecision("abv"),
		brand: varchar("brand", { length: 100 }),
		unitCost: numeric("unitCost", { precision: 12, scale: 4, mode: "number" }),
		measurementType: measurementTypes("measurementType"),
		orgId: orgIdCascade(),
		createdAt: createdAtCol(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		createdBy: text("created_by").notNull(),
		updatedBy: text("updated_by"),
		aiEnrichedFields: text("ai_enriched_fields").array(),
	},
	(table) => [
		/**
		 * (orgId, normalized_name) enforces one ingredient per org per canonical name
		 * and serves org-scoped scans via leftmost-prefix. Compares the stored string
		 * directly so the index agrees with the app's normalization by construction.
		 */
		uniqueIndex("unique_ingredient_name_case_insensitive").on(
			table.orgId,
			table.normalizedName,
		),
		check(
			"abv_valid_range",
			sql`${table.abv} IS NULL OR (${table.abv} >= 0 AND ${table.abv} <= 1)`,
		),
		check(
			"cost_positive",
			sql`${table.unitCost} IS NULL OR ${table.unitCost} > 0`,
		),
		check(
			"cost_requires_measurement_type",
			sql`${table.unitCost} IS NULL OR ${table.measurementType} IS NOT NULL`,
		),
	],
);

export const ingredientsRelations = relations(IngredientsTable, ({ many }) => ({
	lines: many(IngredientLinesTable),
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
	normalizedName: true,
} as const;

/**
 * API/DB constraints — clean types, no coercion.
 * Used by tRPC input validation and service-layer DB validation.
 */
const ingredientConstraints = {
	name: z
		.string("Name is required")
		.trim()
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
		.trim()
		.min(1, "Name is required")
		.max(100, "Name must be 100 characters or less"),
	category: z
		.preprocess(nullifyEmptyField, systemCategories.nullable())
		.optional(),
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
	measurementType: z
		.preprocess(nullifyEmptyField, supportedMeasurements.nullable())
		.optional(),
};

function refineIngredient<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
	return schema.refine(
		(data: z.output<T>) =>
			data.unitCost == null || data.measurementType != null,
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
/**
 * `aiEnrichedFields` is server-owned (set by Enrichment, recomputed on edit) and
 * `normalizedName` is derived from `name`. Neither is client-submittable.
 */
const updateBase = createUpdateSchema(IngredientsTable).omit({
	aiEnrichedFields: true,
	normalizedName: true,
});

/**
 * DB insert schema. Derives the server-owned `normalizedName` from `name` so every
 * insert path (standalone create + recipe-batch) populates the identity key from
 * one place.
 */
export const insertIngredientSchema = refineIngredient(
	insertBase.omit({ normalizedName: true }).extend(ingredientConstraints),
).transform((value) => ({
	...value,
	normalizedName: normalizeIngredientName(value.name),
}));

/** API schema */
export const draftIngredientSchema = refineIngredient(
	draftBase.extend(ingredientConstraints),
);
export const updateIngredientSchema = refineIngredient(
	updateBase.extend(ingredientConstraints),
);

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
