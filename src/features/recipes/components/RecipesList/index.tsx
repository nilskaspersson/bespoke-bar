import type { Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { ViewType } from "@/app/components/SwitchListView";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/components/RecipeActions";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function RecipesList<T extends RecipeWithSpecs>({
	getRowModel,
	className,
	view,
	...props
}: { getRowModel: Table<T>["getRowModel"]; view: ViewType } & Omit<
	ComponentProps<"ul">,
	"children"
>) {
	/**
	 * TanStack Table uses some strange re-rendering patterns behind the scenes that
	 * are incompatible with React Compiler.
	 * https://github.com/TanStack/table/issues/5567
	 */
	"use no memo";

	if (getRowModel().rows.length === 0) {
		return null;
	}

	return (
		<ul
			{...props}
			className={clsx(styles.list, className, {
				[styles.cardLayout]: view === "card",
			})}
		>
			{getRowModel().rows.map((row) => (
				<li key={row.id} className={styles.card}>
					<RecipeCard
						recipe={row.original}
						className={styles.content}
						nameAdornment={
							<Icon
								name="duotone-martini-glass"
								size={3}
								className={styles.icon}
							/>
						}
					/>

					<RecipeActions recipe={row.original} withLink />
				</li>
			))}
		</ul>
	);
}
