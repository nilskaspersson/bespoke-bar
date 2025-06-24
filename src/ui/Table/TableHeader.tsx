import {
	flexRender,
	type SortDirection,
	type Table,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import type { IconName } from "@/ui/Icon/types";
import styles from "./styles.module.css";

const SORT_ICON_MAP = new Map<SortDirection, IconName>([
	["asc", "sort-up"],
	["desc", "sort-down"],
]);

export function TableHeader<T>({
	getHeaderGroups,
	className,
	...props
}: { getHeaderGroups: Table<T>["getHeaderGroups"] } & Omit<
	ComponentProps<"thead">,
	"children"
>) {
	return (
		<thead className={clsx(styles.thead, className)} {...props}>
			{getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id} className={styles.tableHeaderRow}>
					{headerGroup.headers.map((header) => {
						const isSorted = header.column.getIsSorted();
						const canSort = header.column.getCanSort();
						const label = flexRender(
							header.column.columnDef.header,
							header.getContext(),
						);

						return (
							<th
								key={header.id}
								className={clsx(styles.cell, styles.th, {
									[styles.sortable]: canSort,
								})}
							>
								{header.isPlaceholder ? null : canSort ? (
									<Button
										variant="text"
										onClick={header.column.getToggleSortingHandler()}
										color={isSorted ? "heavy" : undefined}
										title={
											header.column.getNextSortingOrder() === "asc"
												? "Sort ascending"
												: header.column.getNextSortingOrder() === "desc"
													? "Sort descending"
													: "Clear sort"
										}
									>
										<span className={styles.label}>
											{label}

											{canSort ? (
												<Icon
													name={isSorted ? SORT_ICON_MAP.get(isSorted) : "sort"}
													size={1}
												/>
											) : null}
										</span>
									</Button>
								) : (
									label
								)}
							</th>
						);
					})}
				</tr>
			))}
		</thead>
	);
}
