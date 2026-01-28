import type { ComponentProps } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { OverscrollList } from "@/features/recipes/components/OverscrollList";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function RecipesList({
	recipes,
	favoriteRecipeIds,
	withActions,
	...props
}: {
	recipes: RecipeWithSpecs[];
	favoriteRecipeIds?: string[];
	withActions?: boolean;
} & Omit<ComponentProps<"ul">, "children">) {
	const favoriteIdSet = new Set(favoriteRecipeIds);

	if (recipes.length === 0) {
		return null;
	}

	return (
		<OverscrollList {...props} padding={6} gap={4}>
			{recipes.map((recipe) => (
				<OverscrollList.Item key={recipe.id}>
					<RecipeCard
						recipe={recipe}
						className={styles.card}
						nameAdornment={
							<Icon
								name="duotone-martini-glass"
								size={3}
								className={styles.icon}
							/>
						}
					/>

					{withActions ? (
						<RecipeActions
							recipe={recipe}
							withLink
							isFavorite={favoriteIdSet.has(recipe.id)}
							className={styles.actions}
						/>
					) : null}
				</OverscrollList.Item>
			))}
		</OverscrollList>
	);
}
