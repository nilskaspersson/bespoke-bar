"use client";

import { buildIngredientMap } from "@bespoke/domain/ingredientLines/stitchIngredients";
import { buildIngredientIndex } from "@bespoke/domain/ingredients/buildIngredientIndex";
import type { RecipeFormData } from "@bespoke/schema/schema/composite";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Keyed } from "@bespoke/schema/types";
import { useFormMetadata } from "@conform-to/react";
import { type ComponentProps, useDeferredValue, useId, useMemo } from "react";
import { DraftRecipesPreview } from "@/features/recipes/components/DraftRecipesPreview";
import { normalizeInput } from "@/utils";
import { recipePreviewSchema } from "./schema";

export function FormDraftPreview({
	ingredients,
	aiEnrichedFields,
	...props
}: Omit<ComponentProps<typeof DraftRecipesPreview>, "recipes"> & {
	ingredients: Ingredient[];
	/** Persisted Auto-filled marks; surfaced on the preview card (static until save). */
	aiEnrichedFields?: string[] | null;
}) {
	const { getFieldset } = useFormMetadata<RecipeFormData>();
	const fields = getFieldset();
	const stableKey = useId();

	const snapshot = {
		recipe: fields.recipe?.value,
		lines: fields.lines.getFieldList().map((line) => ({
			key: line.key,
			value: line.value,
			ingredient: line.getFieldset().ingredient.value,
		})),
	};

	const deferred = useDeferredValue(snapshot);
	const ingredientMap = useMemo(
		() => buildIngredientMap(ingredients),
		[ingredients],
	);
	const ingredientIndex = useMemo(
		() => buildIngredientIndex(ingredients),
		[ingredients],
	);

	const recipe = useMemo<Keyed<BaseRecipe>>(() => {
		const parsed = recipePreviewSchema.safeParse({
			recipe: deferred.recipe,
			lines: deferred.lines.map((s) => ({
				...(s.value && typeof s.value === "object" ? s.value : {}),
				ingredient: s.ingredient,
			})),
		});

		const data = parsed.success
			? parsed.data
			: { recipe: undefined, lines: [] };

		const lines = data.lines.map((line, idx) => {
			/**
			 * Displayed name is the source of truth: if a name is present, resolve by name
			 * (undefined → draft mode, even if `ingredientId` is still set from a stale prior
			 * selection). Only fall back to id when there's no name to compare against.
			 */
			const resolved = line.ingredient?.name
				? ingredientIndex.get(normalizeInput(line.ingredient.name))
				: line.ingredientId
					? ingredientMap.get(line.ingredientId)
					: undefined;

			return {
				...line,
				_key: deferred.lines[idx]?.key ?? `line-${idx}`,
				ingredient: resolved ?? line.ingredient,
			};
		});

		return {
			...data.recipe,
			aiEnrichedFields,
			lines,
			_key: stableKey,
		};
	}, [deferred, ingredientMap, ingredientIndex, stableKey, aiEnrichedFields]);

	return <DraftRecipesPreview {...props} recipes={[recipe]} />;
}
