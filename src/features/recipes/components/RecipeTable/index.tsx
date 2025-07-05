"use client";

import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { clsx } from "clsx";
import Link from "next/link";
import { type ComponentProps, useMemo, useRef, useState } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { UserChip } from "@/features/organisation/components/UserChip";
import type { UserIdMap } from "@/features/organisation/types";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import {
	getRecipeUrl,
	globalFilterRecipeFn,
	sortingFnCreatedAt,
} from "@/features/recipes/utils";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { Button } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Lightbox } from "@/ui/Lightbox";
import { Table, TableBody, TableHeader } from "@/ui/Table";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import { normalizeInput } from "@/utils";
import styles from "./styles.module.css";

type Props = {
	recipes: RecipeWithSpecs[] | undefined | null;
	members: UserIdMap;
};

const columnHelper = createColumnHelper<RecipeWithSpecs>();

export function RecipeTable({
	className,
	recipes,
	members,
	...props
}: Props & ComponentProps<"section">) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);

	const formRef = useRef<HTMLFormElement>(null);

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
				header: "Style",
				cell: () => <Text size={2}>Sour</Text>,
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
		globalFilterFn: globalFilterRecipeFn,
	});

	if (!recipes) {
		return null;
	}

	const hasActiveFilter = Boolean(table.getState().globalFilter);
	const isFilteredEmpty =
		hasActiveFilter && recipes.length > 0 && table.getRowCount() === 0;

	const clearSearch = () => {
		table.resetGlobalFilter();
		formRef.current?.reset();
	};

	return (
		<section className={clsx(className, styles.base)} {...props}>
			<Grid gap={3}>
				{!isFilteredEmpty ? (
					<Table>
						<TableHeader getHeaderGroups={table.getHeaderGroups} />
						<TableBody getRowModel={table.getRowModel} />
					</Table>
				) : null}

				{isFilteredEmpty ? (
					<Grid
						as="aside"
						gap={4}
						className={styles.empty}
						justifyContent="center"
						justifyItems="center"
					>
						<Heading level="h6">Nothing matches your search</Heading>

						<Button
							variant="outline"
							color="accent"
							size="small"
							onClick={clearSearch}
						>
							Clear search
						</Button>
					</Grid>
				) : null}
			</Grid>

			<aside className={styles.sticky}>
				{hasActiveFilter ? (
					<Text as="div" size={0} compact className={styles.status} heavy>
						{table.getRowCount()}{" "}
						{table.getRowCount() === 1 ? "recipe" : "recipes"} matching "
						{table.getState().globalFilter}"
					</Text>
				) : null}

				<Lightbox
					rounded
					translucent
					className={styles.search}
					forceTheme="light"
				>
					<form ref={formRef}>
						<Input
							type="search"
							rounded
							placeholder="Search for recipes…"
							onChange={(e) =>
								table.setGlobalFilter(normalizeInput(e.target.value))
							}
						/>

						{hasActiveFilter ? (
							<Button
								variant="base"
								icon
								className={styles.clear}
								onClick={clearSearch}
							>
								<Icon name="xmark" />
							</Button>
						) : null}
					</form>
				</Lightbox>
			</aside>
		</section>
	);
}
