import type { Recipe } from "@/db/schema/recipes";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import styles from "./styles.module.css";

type Props = {
	recipe: Partial<Recipe>;
};

export function RecipeName({ recipe }: Props) {
	if (!recipe.name) {
		return <span className={styles.unnamed}>{DEFAULT_RECIPE_NAME}</span>;
	}

	return recipe.name;
}
