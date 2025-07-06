import type { FilterFn, SortingFn } from "@tanstack/react-table";
import { normalizeInput } from "@/utils";
import { collator } from "@/utils/formatting";

export const sortingFnCreatedAt: SortingFn<{
	createdAt: Date;
	name: string | null;
}> = (rowA, rowB) => {
	const dateA = rowA.original.createdAt.getTime();
	const dateB = rowB.original.createdAt.getTime();

	if (dateA !== dateB) {
		return dateA - dateB;
	}

	return collator.compare(rowA.original.name ?? "", rowB.original.name ?? "");
};

export const globalFilterFn: FilterFn<unknown> = (row, columnId, filterValue) =>
	normalizeInput(String(row.getValue(columnId) || "")).includes(filterValue);
