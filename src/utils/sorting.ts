import type { Row } from "@tanstack/react-table";
import { normalizeInput } from "@/utils";
import { collator } from "@/utils/formatting";

export function sortingFnCreatedAt<
	T extends { createdAt: Date; name: string | null },
>(rowA: Row<T>, rowB: Row<T>) {
	const dateA = rowA.original.createdAt.getTime();
	const dateB = rowB.original.createdAt.getTime();

	if (dateA !== dateB) {
		return dateA - dateB;
	}

	return collator.compare(rowA.original.name ?? "", rowB.original.name ?? "");
}

export function globalFilterFn<T>(
	row: Row<T>,
	columnId: string,
	filterValue: string,
) {
	return normalizeInput(String(row.getValue(columnId) || "")).includes(
		filterValue,
	);
}
