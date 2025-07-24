import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { RecipeListEntryCard } from "@/features/lists/components/RecipeListEntryCard";
import styles from "./styles.module.css";

export function RecipeEntryList({
	entries,
}: {
	entries: RecipeListEntryWithRecipe[];
}) {
	if (entries.length === 0) {
		return null;
	}

	return (
		<ul className={styles.recipes}>
			{entries.map((entry) => (
				<li key={entry.id}>
					<RecipeListEntryCard entry={entry} />
				</li>
			))}
		</ul>
	);
}
