import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { EMPTY_RECIPE } from "@/features/recipes/constants";
import { Grid } from "@/ui/Grid";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export function DraftRecipesPreview({
	className,
	recipes,
	...props
}: Omit<ComponentProps<"aside">, "children"> & {
	recipes: Keyed<BaseRecipe>[];
}) {
	return (
		<aside className={clsx(styles.panel, className)} {...props}>
			<Grid as="ul" gap={4}>
				{recipes.length === 0 ? (
					<li key="placeholder">
						<RecipeCard recipe={EMPTY_RECIPE} />
					</li>
				) : (
					recipes.map((recipe) => (
						<li key={getKey(recipe)}>
							<RecipeCard recipe={recipe} />
						</li>
					))
				)}
			</Grid>
		</aside>
	);
}
