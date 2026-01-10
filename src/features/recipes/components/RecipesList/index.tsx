import type { Table } from "@tanstack/react-table";
import type { ComponentProps } from "react";
import type { ViewType } from "@/app/components/SwitchListView";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { OverscrollList } from "@/features/recipes/components/OverscrollList";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function RecipesList<T extends RecipeWithSpecs>({
	getRowModel,
	className,
	view,
	favoriteRecipeIds,
	...props
}: {
	getRowModel: Table<T>["getRowModel"];
	view: ViewType;
	favoriteRecipeIds?: string[];
} & Omit<ComponentProps<"ul">, "children">) {
	/**
	 * TanStack Table uses some strange re-rendering patterns behind the scenes that
	 * are incompatible with React Compiler.
	 * https://github.com/TanStack/table/issues/5567
	 */
	"use no memo";

	const favoriteIdSet = new Set(favoriteRecipeIds);

	if (getRowModel().rows.length === 0) {
		return null;
	}

	return (
		<OverscrollList
			{...props}
			padding={6}
			gap={4}
			direction={view === "card" ? "horizontal" : "vertical"}
		>
			{getRowModel().rows.map((row) => (
				<OverscrollList.Item key={row.id}>
					<RecipeCard
						recipe={row.original}
						className={styles.card}
						nameAdornment={
							<Icon
								name="duotone-martini-glass"
								size={3}
								className={styles.icon}
							/>
						}
					/>

					<RecipeActions
						recipe={row.original}
						withLink
						isFavorite={favoriteIdSet.has(row.original.id)}
						className={styles.actions}
					/>
				</OverscrollList.Item>
			))}
		</OverscrollList>
	);
}
