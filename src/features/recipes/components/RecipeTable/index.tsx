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
import { Button } from "@/ui/Button";
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
					cell: (info) =>
						info.row.original.specs.map((spec) => (
							<div key={spec.id} className={styles.spec}>
								{spec.quantity} {spec.unit}{" "}
								<Link
									href={getIngredientUrl(spec.ingredient)}
									prefetch={false}
									className={styles.ingredient}
								>
									{spec.ingredient.name}
								</Link>
							</div>
						)),
				},
			),
			columnHelper.accessor("preparationMethod", {
				header: "Style",
				cell: () => <Text size={2}>Sour</Text>,
			}),
			columnHelper.accessor("createdAt", {
				header: "Created",
				cell: (info) => <Time date={info.row.original.createdAt} size={2} />,
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

	const clearSearch = () => {
		table.resetGlobalFilter();
		formRef.current?.reset();
	};

	return (
		<section className={clsx(className, styles.base)} {...props}>
			<div>
				<Table>
					<TableHeader getHeaderGroups={table.getHeaderGroups} />
					<TableBody getRowModel={table.getRowModel} />
				</Table>

				{hasActiveFilter && recipes.length > 0 && table.getRowCount() === 0 ? (
					<aside className={styles.empty}>
						<Heading level="h6">Nothing matches your search</Heading>

						<Button
							variant="outline"
							color="accent"
							size="small"
							onClick={clearSearch}
						>
							Clear search
						</Button>
					</aside>
				) : null}
			</div>

			<Lightbox rounded className={styles.search}>
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
		</section>
	);
}
