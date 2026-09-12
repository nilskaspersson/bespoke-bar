"use client";

import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { RecipeCard } from "@bespoke/ui/RecipeCard";

export function DraftRecipeCard({
	recipe,
	className,
}: {
	recipe: BaseRecipe;
	className?: string;
}) {
	return (
		<RecipeCard
			className={className}
			isPublic
			withLink={false}
			animateNumbers={false}
			recipe={recipe}
		/>
	);
}
