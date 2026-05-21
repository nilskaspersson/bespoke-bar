"use client";

import { useFormMetadata } from "@conform-to/react";
import { type ComponentProps, useDeferredValue, useId, useMemo } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe } from "@/db/schema/recipes";
import { buildIngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { DraftRecipesPreview } from "@/features/recipes/components/DraftRecipesPreview";
import { buildIngredientMap } from "@/features/specs/utils/stitchIngredients";
import { normalizeInput } from "@/utils";
import type { Keyed } from "@/utils/withKey";
import { recipePreviewSchema } from "./schema";

export function FormDraftPreview({
	ingredients,
	...props
}: Omit<ComponentProps<typeof DraftRecipesPreview>, "recipes"> & {
	ingredients: Ingredient[];
}) {
	const { getFieldset } = useFormMetadata<RecipeFormData>();
	const fields = getFieldset();
	const stableKey = useId();

	const snapshot = {
		recipe: fields.recipe?.value,
		specs: fields.specs.getFieldList().map((spec) => ({
			key: spec.key,
			value: spec.value,
			ingredient: spec.getFieldset().ingredient.value,
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
			specs: deferred.specs.map((s) => ({
				...(s.value && typeof s.value === "object" ? s.value : {}),
				ingredient: s.ingredient,
			})),
		});

		const data = parsed.success
			? parsed.data
			: { recipe: undefined, specs: [] };

		const specs = data.specs.map((spec, idx) => {
			/**
			 * Displayed name is the source of truth: if a name is present, resolve by name
			 * (undefined → draft mode, even if `ingredientId` is still set from a stale prior
			 * selection). Only fall back to id when there's no name to compare against.
			 */
			const resolved = spec.ingredient?.name
				? ingredientIndex.get(normalizeInput(spec.ingredient.name))
				: spec.ingredientId
					? ingredientMap.get(spec.ingredientId)
					: undefined;

			return {
				...spec,
				_key: deferred.specs[idx]?.key ?? `spec-${idx}`,
				ingredient: resolved ?? spec.ingredient,
			};
		});

		return {
			...data.recipe,
			specs,
			_key: stableKey,
		};
	}, [deferred, ingredientMap, ingredientIndex, stableKey]);

	return <DraftRecipesPreview {...props} recipes={[recipe]} />;
}
