import { systemCategorySchema } from "@bespoke/schema/schema/categories.zod";
import { cocktailStyleSchema } from "@bespoke/schema/schema/cocktailStyles.zod";
import { iceSchema } from "@bespoke/schema/schema/ice.zod";
import { preparationMethodSchema } from "@bespoke/schema/schema/preparationMethods.zod";
import { unitSchema } from "@bespoke/schema/schema/units.zod";
import { z } from "zod";

const classicIngredientSchema = z.object({
	name: z.string().min(1),
	quantity: z.number().positive().nullable(),
	unit: unitSchema.nullable(),
	optional: z.boolean(),
	category: systemCategorySchema,
	brand: z.string().min(1).nullable(),
});

export const classicCocktailSchema = z.object({
	name: z.string().min(1),
	preparationMethod: preparationMethodSchema,
	style: cocktailStyleSchema,
	garnish: z.string().min(1).nullable(),
	ice: iceSchema,
	specAdjusted: z.string().min(1).optional(),
	ingredients: z.array(classicIngredientSchema).min(1),
});

export const classicCocktailRegistrySchema = z.object({
	meta: z.object({
		description: z.string(),
		specSource: z.url(),
		conventions: z.string(),
	}),
	cocktails: z.array(classicCocktailSchema),
});

export type ClassicCocktail = z.infer<typeof classicCocktailSchema>;
