"use client";

import { useFormData } from "@conform-to/react/future";
import { parseWithZod } from "@conform-to/zod/v4";
import type { RefObject } from "react";
import { type BaseRecipe, updateRecipeSchema } from "@/db/schema/recipes";
import { RecipeInfo } from "@/features/recipes/components/RecipeInfo";

export function PreviewDraftRecipe(props: {
	formRef: RefObject<HTMLFormElement | null>;
}) {
	const draftRecipe: BaseRecipe | null = useFormData(
		props.formRef,
		(formData) => {
			if (!formData) return null;
			return parseWithZod(formData, { schema: updateRecipeSchema }).payload;
		},
	);

	if (!draftRecipe) {
		return null;
	}

	return (
		<div>
			<RecipeInfo recipe={draftRecipe} />
		</div>
	);
}
