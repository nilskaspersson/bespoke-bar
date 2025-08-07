import { flexRender, type Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { ViewType } from "@/app/components/SwitchListView";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/components/RecipeActions";
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
	if (getRowModel().rows.length === 0) {
		return null;
	}

	return (
		<ul
			className={clsx(styles.list, className, {
				[styles.cardLayout]: view === "card",
			})}
			{...props}
		>
			{getRowModel().rows.map((row) => {
				const name = row
					.getVisibleCells()
					.find((cell) => cell.column.id === "name");

				const specs = row
					.getVisibleCells()
					.find((cell) => cell.column.id === "specs");

				return (
					<li key={row.id} className={styles.card}>
						<section className={styles.content}>
							<div className={styles.primary}>
								<div>
									{name
										? flexRender(name.column.columnDef.cell, name.getContext())
										: null}
								</div>

								{specs
									? flexRender(specs.column.columnDef.cell, specs.getContext())
									: null}
							</div>

							<div>
								<Icon
									name="duotone-martini-glass"
									size={3}
									className={styles.icon}
								/>
							</div>
						</section>

						<RecipeActions recipe={row.original} withLink />
					</li>
				);
			})}
		</ul>
	);
}
