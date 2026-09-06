import { EMPTY_RECIPE } from "@bespoke/domain/recipes/constants";
import { getKey } from "@bespoke/domain/utils/withKey";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Keyed } from "@bespoke/schema/types";
import type { ComponentProps } from "react";
import { GraphPaper } from "../GraphPaper";
import { RecipeCard } from "../RecipeCard";
import styles from "./styles.module.css";

export function DraftRecipesPreview({
	className,
	recipes,
	...props
}: Omit<ComponentProps<"aside">, "children"> & {
	recipes: Keyed<BaseRecipe>[];
}) {
	return (
		<GraphPaper as="aside" className={className} {...props}>
			<ul className={styles.list}>
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
			</ul>
		</GraphPaper>
	);
}
