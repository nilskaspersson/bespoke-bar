import type { Row } from "@tanstack/react-table";
import { normalizeInput } from "@/utils";
import { collator } from "@/utils/collator";

export function sortingFnCreatedAt<
	T extends { createdAt: string; name: string | null },
>(rowA: Row<T>, rowB: Row<T>) {
	const dateA = new Date(rowA.original.createdAt).getTime();
	const dateB = new Date(rowB.original.createdAt).getTime();

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
