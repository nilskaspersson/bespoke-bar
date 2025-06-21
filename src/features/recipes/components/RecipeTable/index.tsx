"use client";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import Link from "next/link";
import { type ComponentProps, useState } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import {
	getRecipeUrl,
	globalFilterRecipeFn,
	sortingFnCreatedAt,
} from "@/features/recipes/utils";
import { Input } from "@/ui/Input";
import { TableHeader } from "@/ui/Table/TableHeader";
import { Text } from "@/ui/Text";
import { normalizeInput } from "@/utils";
import styles from "./styles.module.css";

type Props = {
	recipes: RecipeWithSpecs[] | undefined | null;
};

const columnHelper = createColumnHelper<RecipeWithSpecs>();

const columns = [
	columnHelper.accessor("name", {
		header: "Name",
		cell: (info) => (
			<Link href={getRecipeUrl(info.row.original)} prefetch={false}>
				<RecipeName recipe={info.row.original} />
			</Link>
		),
		sortingFn: "text",
	}),
	columnHelper.accessor(
		(row) => row.specs.map((spec) => spec.ingredient.name).join(", "),
		{
			id: "specs",
			header: "Specs",
			cell: (info) =>
				info.row.original.specs.map((spec, i, arr) => (
					<Text key={spec.ingredient.id}>
						<Link href={getIngredientUrl(spec.ingredient)} prefetch={false}>
							{spec.ingredient.name}
						</Link>

						{i < arr.length - 1 && ", "}
					</Text>
				)),
		},
	),
	columnHelper.accessor("preparationMethod", {
		header: "Preparation Method",
	}),
	columnHelper.accessor("createdAt", {
		header: "Created At",
		sortingFn: sortingFnCreatedAt,
	}),
	columnHelper.accessor("createdBy", {
		header: "Created By",
	}),
];

export function RecipeTable({
	className,
	recipes,
	...props
}: Props & ComponentProps<"section">) {
	const [data] = useState(() => structuredClone(recipes ?? []));
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
		globalFilterFn: globalFilterRecipeFn,
	});

	if (!recipes) {
		return null;
	}

	return (
		<section className={clsx(className)} {...props}>
			<div>
				<Input
					type="search"
					placeholder="Search…"
					onChange={(e) =>
						table.setGlobalFilter(normalizeInput(e.target.value))
					}
				/>
			</div>

			<table className={styles.table}>
				<TableHeader table={table} />

				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
