"use client";

import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { type ComponentProps, use, useMemo, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { useFormatIngredientUnitCost } from "@/features/ingredients/hooks/useFormatIngredientUnitCost";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { FormatterContext } from "@/hooks/useFormatter";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { Table, TableBody, TableHeader } from "@/ui/Table";
import { TableLayout } from "@/ui/TableLayout";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import { globalFilterFn, sortingFnCreatedAt } from "@/utils/sorting";

type Props = {
	ingredients: Ingredient[] | undefined | null;
};

const columnHelper = createColumnHelper<Ingredient>();

export function IngredientTable({
	className,
	ingredients,
	...props
}: Props & ComponentProps<"section">) {
	/**
	 * TanStack Table uses some strange re-rendering patterns behind the scenes that
	 * are incompatible with React Compiler.
	 * https://github.com/TanStack/table/issues/5567
	 */
	"use no memo";

	const { percentageFormatter } = use(FormatterContext);
	const formatIngredientUnitCost = useFormatIngredientUnitCost();

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: "Name",
				size: 200,
				maxSize: 200,
				cell: (info) => (
					<Link href={getIngredientUrl(info.row.original)} prefetch={false}>
						<Text size={2} heavy>
							{info.row.original.name}
						</Text>
					</Link>
				),
				sortingFn: "text",
			}),
			columnHelper.accessor("category", {
				header: "Category",
				cell: (info) =>
					info.row.original.category ? (
						<Text size={2}>
							{CATEGORY_TO_LABEL.get(info.row.original.category)}
						</Text>
					) : null,
			}),
			columnHelper.accessor("abv", {
				header: "ABV",
				cell: (info) =>
					info.row.original.abv ? (
						<Text size={2}>
							{percentageFormatter.format(info.row.original.abv)}
						</Text>
					) : null,
			}),
			columnHelper.accessor("unitCost", {
				header: "Unit Cost",
				cell: (info) =>
					info.row.original.unitCost ? (
						<Text size={2}>
							{formatIngredientUnitCost(
								info.row.original.unitCost,
								info.row.original.measurementType,
							)}
						</Text>
					) : null,
			}),
			columnHelper.accessor("brand", {
				header: "Brand",
				cell: (info) =>
					info.row.original.brand ? (
						<Text size={2}>{info.row.original.brand}</Text>
					) : null,
			}),
			columnHelper.accessor("createdAt", {
				header: "Created",
				cell: (info) => (
					<Time date={info.row.original.createdAt} size={2} italic />
				),
				sortingFn: sortingFnCreatedAt,
			}),
		],
		[formatIngredientUnitCost, percentageFormatter],
	);

	const table = useReactTable({
		/**
		 * Set to false to prevent internal warning. Absolute nonsense.
		 * https://github.com/TanStack/table/issues/5026#issuecomment-2528094258
		 */
		autoResetPageIndex: false,
		columns,
		data: ingredients ?? [],
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
		globalFilterFn,
	});

	if (!ingredients) {
		return null;
	}

	return (
		<TableLayout
			table={table}
			searchPlaceholder="Search for ingredients…"
			{...props}
		>
			<Table>
				<TableHeader getHeaderGroups={table.getHeaderGroups} />
				<TableBody getRowModel={table.getRowModel} />
			</Table>
		</TableLayout>
	);
}

export function IngredientTableSkeleton() {
	return (
		<SkeletonScreen>
			<Skeleton width="100%" height="100lvh" />
		</SkeletonScreen>
	);
}
