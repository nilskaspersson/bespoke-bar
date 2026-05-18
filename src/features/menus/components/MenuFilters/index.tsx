"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { EmptyArea } from "@/components/EmptyArea";
import type { MenuWithRecipes } from "@/db/schema/composite";
import type { MenuEntryWithRecipe } from "@/db/schema/menuEntries";
import { MenuEntryList } from "@/features/menus/entries/components/MenuEntryList";
import { Button, LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid, type GridProps } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Input } from "@/ui/Input";
import { createSearchIndex, searchByIndex } from "@/utils/search";

const getEntryKey = (entry: MenuEntryWithRecipe) => entry.id;

function getEntrySearchFields(entry: MenuEntryWithRecipe): string[] {
	return [
		entry.recipe.name ?? "",
		...entry.recipe.specs.map((spec) => spec.ingredient.name),
	];
}

export function MenuFilters({
	menu,
	editable,
	withActions,
	...props
}: Omit<GridProps, "menu"> & {
	menu: MenuWithRecipes;
	editable?: boolean;
	withActions?: boolean;
}) {
	const { entries } = menu;

	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	const searchIndex = useMemo(
		() => createSearchIndex(entries, getEntryKey, getEntrySearchFields),
		[entries],
	);

	const filteredEntries = useMemo(
		() => searchByIndex(entries, searchIndex, getEntryKey, deferredSearch),
		[entries, searchIndex, deferredSearch],
	);

	return (
		<Grid gap={6}>
			{entries.length > 0 ? (
				<Input
					type="search"
					value={search}
					placeholder="Search in Menu…"
					fullWidth
					onChange={(e) => setSearch(e.target.value)}
				/>
			) : null}

			{filteredEntries.length === 0 && entries.length > 0 ? (
				<EmptyArea color="light">
					<Heading level="h3" size={4}>
						No recipes found
					</Heading>

					<Flex as="menu" gap={2} wrap justifyContent="center">
						<li>
							<LinkButton
								href={`/bar/menus/${menu.id}/edit`}
								variant="outline"
								color="light"
								size="small"
							>
								Add recipes
							</LinkButton>
						</li>

						<li>
							<Button
								variant="outline"
								color="light"
								size="small"
								onClick={() => setSearch("")}
							>
								Clear search
							</Button>
						</li>
					</Flex>
				</EmptyArea>
			) : (
				<MenuEntryList
					entries={filteredEntries}
					editable={editable}
					withActions={withActions}
					{...props}
				/>
			)}
		</Grid>
	);
}
