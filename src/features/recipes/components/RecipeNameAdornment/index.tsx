"use client";

import { useEffect, useRef } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { RecipeActionsToggle } from "@/features/recipes/actions/components/RecipeActionsToggle";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { ServingsBadge } from "@/features/recipes/components/ServingsBadge";
import { getRecipeName } from "@/features/recipes/utils";
import { Icon } from "@/ui/Icon";
import { animate, keyframes } from "@/utils/animate";

type Props = {
	recipe: RecipeWithSpecs;
	servings?: number;
	isFavorite?: boolean;
	onDelete?: () => void;
	withActions?: boolean;
	withLink?: boolean;
};

export function RecipeNameAdornment({
	recipe,
	servings,
	isFavorite,
	onDelete,
	withActions,
	withLink,
}: Props) {
	const badgeRef = useRef<HTMLSpanElement>(null);
	const prevServings = useRef(servings);

	useEffect(() => {
		const prev = prevServings.current;
		const wasUpscaled = prev != null && prev > 1;

		if (wasUpscaled && prev !== servings) {
			animate(badgeRef.current, keyframes.get("pulse"));
		}

		prevServings.current = servings;
	}, [servings]);

	return (
		<>
			{servings != null && servings > 1 ? (
				<ServingsBadge servings={servings} ref={badgeRef} />
			) : null}

			<Icon name="duotone-martini-glass" size={3} />

			{withActions ? (
				<RecipeActionsToggle
					heading={<RecipeName recipe={recipe} />}
					label={`Actions for ${getRecipeName(recipe)}`}
				>
					<RecipeActions
						recipe={recipe}
						withLink={withLink}
						isFavorite={isFavorite}
						onDelete={onDelete}
					/>
				</RecipeActionsToggle>
			) : null}
		</>
	);
}
