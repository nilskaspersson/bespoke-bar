import { clsx } from "clsx";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { RecipeListEntryCard } from "@/features/lists/components/RecipeListEntryCard";
import styles from "./styles.module.css";

export function RecipeEntryList({
	entries,
	editable,
	className,
}: {
	entries: RecipeListEntryWithRecipe[];
	editable?: boolean;
	className?: string;
}) {
	if (entries.length === 0) {
		return null;
	}

	return (
		<ul className={clsx(styles.recipes, className)}>
			{entries.map((entry) => (
				<li key={entry.id}>
					<RecipeListEntryCard entry={entry} editable={editable} />
				</li>
			))}
		</ul>
	);
}
