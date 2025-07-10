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
import { type ComponentProps, useMemo, useState } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { UserChip } from "@/features/organisation/components/UserChip";
import type { UserIdMap } from "@/features/organisation/types";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { METHOD_TO_LABEL } from "@/features/recipes/constants";
import { getRecipeUrl } from "@/features/recipes/utils";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { Table, TableBody, TableHeader } from "@/ui/Table";
import { TableLayout } from "@/ui/TableLayout";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import { globalFilterFn, sortingFnCreatedAt } from "@/utils/sorting";
import styles from "./styles.module.css";

type Props = {
	recipes: RecipeWithSpecs[] | undefined | null;
	members: UserIdMap;
	disableSearch?: boolean;
};

const columnHelper = createColumnHelper<RecipeWithSpecs>();

export function RecipeTable({
	className,
	recipes,
	members,
	disableSearch,
	...props
}: Props & ComponentProps<"section">) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: "Name",
				size: 200,
				maxSize: 200,
				cell: (info) => (
					<Link
						href={getRecipeUrl(info.row.original)}
						prefetch={false}
						className={styles.recipeName}
					>
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
					enableSorting: false,
					cell: (info) => (
						<ul>
							{info.row.original.specs.map((spec) => (
								<li key={spec.id} className={styles.spec}>
									{spec.quantity} {getFormattedUnit(spec.unit, spec.quantity)}{" "}
									<Link
										href={getIngredientUrl(spec.ingredient)}
										prefetch={false}
										className={styles.ingredient}
										title={spec.ingredient.name}
									>
										{spec.ingredient.name}
									</Link>
								</li>
							))}
						</ul>
					),
				},
			),
			columnHelper.accessor("preparationMethod", {
				header: "Method",
				cell: (info) =>
					info.row.original.preparationMethod ? (
						<Text size={2}>
							{METHOD_TO_LABEL.get(info.row.original.preparationMethod)}
						</Text>
					) : null,
			}),
			columnHelper.accessor("createdAt", {
				header: "Created",
				cell: (info) => (
					<Time date={info.row.original.createdAt} size={2} italic />
				),
				sortingFn: sortingFnCreatedAt,
			}),
			columnHelper.accessor(
				(row) => {
					const user = members[row.createdBy];
					if (!user) return null;
					return `${user.firstName} ${user.lastName}`;
				},
				{
					header: "Author",
					cell: (info) => (
						<UserChip user={members[info.row.original.createdBy]} />
					),
				},
			),
		],
		[members],
	);

	const table = useReactTable({
		/**
		 * Set to false to prevent internal warning. Absolute nonsense.
		 * https://github.com/TanStack/table/issues/5026#issuecomment-2528094258
		 */
		autoResetPageIndex: false,
		columns,
		data: recipes ?? [],
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
		globalFilterFn,
	});

	if (!recipes) {
		return null;
	}

	return (
		<TableLayout
			table={table}
			searchPlaceholder="Search for recipes…"
			disableSearch={disableSearch}
			{...props}
		>
			<Table>
				<TableHeader getHeaderGroups={table.getHeaderGroups} />
				<TableBody getRowModel={table.getRowModel} />
			</Table>
		</TableLayout>
	);
}
