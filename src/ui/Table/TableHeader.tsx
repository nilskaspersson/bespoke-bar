import {
	flexRender,
	type SortDirection,
	type Table,
} from "@tanstack/react-table";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import type { IconName } from "@/ui/Icon/types";

const SORT_ICON_MAP = new Map<SortDirection, IconName>([
	["asc", "sort-up"],
	["desc", "sort-down"],
]);

export function TableHeader<T>({ table }: { table: Table<T> }) {
	return (
		<thead>
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						const isSorted = header.column.getIsSorted();

						return (
							<th key={header.id}>
								{header.isPlaceholder ? null : (
									<Button
										variant="text"
										onClick={header.column.getToggleSortingHandler()}
										color={isSorted ? "heavy" : undefined}
										title={
											header.column.getCanSort()
												? header.column.getNextSortingOrder() === "asc"
													? "Sort ascending"
													: header.column.getNextSortingOrder() === "desc"
														? "Sort descending"
														: "Clear sort"
												: undefined
										}
									>
										<Icon
											name={isSorted ? SORT_ICON_MAP.get(isSorted) : "sort"}
											size="small"
										/>

										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</Button>
								)}
							</th>
						);
					})}
				</tr>
			))}
		</thead>
	);
}
