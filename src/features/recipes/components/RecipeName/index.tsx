import type { Recipe } from "@/db/schema/recipes";
import styles from "./styles.module.css";

type Props = {
	recipe: Recipe;
};

export function RecipeName({ recipe }: Props) {
	if (!recipe.name) {
		return <span className={styles.unnamed}>Unnamed Recipe</span>;
	}

	return recipe.name;
}
