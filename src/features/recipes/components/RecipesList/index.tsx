import { flexRender, type Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { ViewType } from "@/app/components/SwitchListView";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getRecipeUrl } from "@/features/recipes/utils";
import { useGetSpecsToText } from "@/features/specs/hooks/useGetSpecsToText";
import { LinkButton } from "@/ui/Button";
import { CopyToClipboard } from "@/ui/CopyToClipboard/inded";
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
	const getSpecsToText = useGetSpecsToText();

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

						<menu className={styles.actions}>
							<li>
								<LinkButton
									variant="ghost"
									size="tiny"
									href={getRecipeUrl(row.original)}
									className={styles.action}
									color="accent"
								>
									<Icon name="arrow-right" size={0} />
									View recipe
								</LinkButton>
							</li>

							<li>
								<LinkButton
									variant="ghost"
									size="tiny"
									href={`/bar/recipes/${row.original.id}/edit`}
									className={styles.action}
									prefetch={false}
									color="accent"
								>
									<Icon name="pen-to-square" size={0} />
									Edit
								</LinkButton>
							</li>

							<li>
								<CopyToClipboard
									getValue={() => {
										const specsText = getSpecsToText(row.original.specs);
										return `${row.original.name}${specsText ? `\n${specsText}` : ""}`;
									}}
									variant="ghost"
									size="tiny"
									iconSize={0}
									className={styles.action}
								>
									Copy
								</CopyToClipboard>
							</li>
						</menu>
					</li>
				);
			})}
		</ul>
	);
}
