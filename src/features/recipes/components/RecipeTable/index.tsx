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
import { useQueryState } from "nuqs";
import { type ComponentProps, useMemo, useState } from "react";
import { listViewParser, type ViewType } from "@/app/components/SwitchListView";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { UserChip } from "@/features/organisation/components/UserChip";
import type { UserIdMap } from "@/features/organisation/types";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { COCKTAIL_STYLE_TO_LABEL } from "@/features/recipes/constants";
import { getRecipeUrl } from "@/features/recipes/utils";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { Grid } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { Table, TableBody, TableHeader } from "@/ui/Table";
import { TableLayout } from "@/ui/TableLayout";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import { globalFilterFn, sortingFnCreatedAt } from "@/utils/sorting";
import styles from "./styles.module.css";

type Props = {
	recipes: RecipeWithSpecs[] | undefined | null;
	members: UserIdMap;
	favoriteRecipeIds?: string[];
	disableSearch?: boolean;
	defaultView?: ViewType;
};

const columnHelper = createColumnHelper<RecipeWithSpecs>();

export function RecipeTable({
	className,
	recipes,
	members,
	favoriteRecipeIds,
	disableSearch,
	defaultView = "list",
	...props
}: Props & ComponentProps<"section">) {
	/**
	 * TanStack Table uses some strange re-rendering patterns behind the scenes that
	 * are incompatible with React Compiler.
	 * https://github.com/TanStack/table/issues/5567
	 */
	"use no memo";

	/**
	 * TODO: Adapt nuqs
	 */
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);

	const [view] = useQueryState("view", listViewParser.withDefault(defaultView));

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
					cell: (info) =>
						info.row.original.specs.length > 0 ? (
							<ul className={styles.specs}>
								{info.row.original.specs.map((spec) => (
									<li key={spec.id}>
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
						) : (
							<Text size={2} italic light>
								No specs
							</Text>
						),
				},
			),
			columnHelper.accessor("style", {
				header: "Style",
				cell: (info) =>
					info.row.original.style ? (
						<Text size={2} className={styles.hiddenSmall}>
							{COCKTAIL_STYLE_TO_LABEL.get(info.row.original.style)}
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
			{view === "table" ? (
				<Table>
					<TableHeader getHeaderGroups={table.getHeaderGroups} />
					<TableBody getRowModel={table.getRowModel} />
				</Table>
			) : null}

			{view === "list" || view === "card" ? (
				<RecipesList
					getRowModel={table.getRowModel}
					view={view}
					favoriteRecipeIds={favoriteRecipeIds}
				/>
			) : null}
		</TableLayout>
	);
}

/**
 * Direct property assignment doesn't work in client components.
 */
export function RecipeTableSkeleton() {
	return (
		<SkeletonScreen>
			<Grid gap={4}>
				<Skeleton width="100%" height="147px" />
				<Skeleton width="100%" height="147px" />
				<Skeleton width="100%" height="147px" />
			</Grid>
		</SkeletonScreen>
	);
}
