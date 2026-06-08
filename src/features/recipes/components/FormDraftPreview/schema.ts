import { z } from "zod";
import { systemCategories } from "@/db/schema/categories";
import { upsertRecipeSchema } from "@/db/schema/composite";
import { supportedMeasurements, supportedUnits } from "@/db/schema/units";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";
import { isEmptyField, nullifyEmptyField } from "@/utils/form";

function emptyToUndefined(value: unknown): unknown {
	return isEmptyField(value) ? undefined : value;
}

const optionalString = z.preprocess(emptyToUndefined, z.string()).optional();

const nullableString = z
	.preprocess(nullifyEmptyField, z.string().nullable())
	.optional();

const nullableNumber = z
	.preprocess(nullifyEmptyField, z.coerce.number().nullable())
	.optional();

const nullableBoolean = z
	.preprocess((v) => {
		if (typeof v === "boolean") return v;
		if (v === "on" || v === "true") return true;
		if (v === "off" || v === "false") return false;
		return null;
	}, z.boolean().nullable())
	.optional();

const previewIngredientSchema = z.object({
	name: optionalString,
	description: nullableString,
	category: z
		.preprocess(nullifyEmptyField, systemCategories.nullable())
		.optional(),
	abv: percentageToRatioSchema.optional(),
	brand: nullableString,
	unitCost: nullableNumber,
	measurementType: z
		.preprocess(nullifyEmptyField, supportedMeasurements.nullable())
		.optional(),
});

const previewSpecSchema = z.object({
	id: optionalString,
	quantity: nullableNumber,
	unit: z.preprocess(nullifyEmptyField, supportedUnits.nullable()).optional(),
	ingredientId: optionalString,
	optional: nullableBoolean,
	ingredient: previewIngredientSchema.default(() => ({})),
});

const previewRecipeSchema = upsertRecipeSchema
	.partial()
	.extend({ dilutionTarget: nullableNumber });

export const recipePreviewSchema = z.object({
	recipe: previewRecipeSchema.optional(),
	specs: z.array(previewSpecSchema).optional().default([]),
});

/** @public */
export type RecipePreviewData = z.infer<typeof recipePreviewSchema>;
