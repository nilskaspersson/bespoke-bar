"use client";

import clsx from "clsx";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	recipes: RecipeWithRelations[];
	favoriteRecipeIds: string[];
	tagOptions: Tag[];
	hasFilters: boolean;
	onResetFilters: () => void;
	className?: string;
};

export function RecipeList({
	recipes,
	favoriteRecipeIds,
	tagOptions,
	hasFilters,
	onResetFilters,
	className,
}: Props) {
	if (recipes.length === 0) {
		return (
			<div className={clsx(styles.gridArea, className)}>
				<div className={styles.empty}>
					<Text as="p" size={3} light>
						No recipes match these filters.
					</Text>

					<Button variant="text" size="small" onClick={onResetFilters}>
						Reset filters
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={clsx(styles.gridArea, className)}>
			<RecipesList
				recipes={recipes}
				favoriteRecipeIds={favoriteRecipeIds}
				tagOptions={tagOptions}
				withActions
				withCreate={!hasFilters}
				className={styles.list}
			/>
		</div>
	);
}
