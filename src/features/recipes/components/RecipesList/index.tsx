import { flexRender, type Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { EntityActions } from "@/app/components/EntityActions";
import { ShareAction } from "@/app/components/ShareAction";
import type { ViewType } from "@/app/components/SwitchListView";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getRecipeUrl } from "@/features/recipes/utils";
import { useGetSpecsToText } from "@/features/specs/hooks/useGetSpecsToText";
import { LinkButton } from "@/ui/Button";
import { CopyToClipboard } from "@/ui/CopyToClipboard";
import { Icon } from "@/ui/Icon";
import { getServerSideBaseURL } from "@/utils/url";
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

						<EntityActions>
							{(actionProps) => (
								<>
									<li>
										<LinkButton
											{...actionProps}
											href={getRecipeUrl(row.original)}
											color="accent"
										>
											<Icon name="arrow-right" size={1} />
											View
										</LinkButton>
									</li>

									<li>
										<LinkButton
											{...actionProps}
											href={`/bar/recipes/${row.original.id}/edit`}
											prefetch={false}
											color="accent"
										>
											<Icon name="pen-to-square" size={1} />
											Edit
										</LinkButton>
									</li>

									<li>
										<CopyToClipboard
											{...actionProps}
											getValue={() => {
												const specsText = getSpecsToText(row.original.specs);
												return `${row.original.name}${specsText ? `\n${specsText}` : ""}`;
											}}
											iconSize={1}
										>
											Copy
										</CopyToClipboard>
									</li>

									<li>
										<ShareAction
											{...actionProps}
											value={new URL(
												getRecipeUrl(row.original),
												getServerSideBaseURL(),
											).toString()}
										>
											Share link
										</ShareAction>
									</li>
								</>
							)}
						</EntityActions>
					</li>
				);
			})}
		</ul>
	);
}
