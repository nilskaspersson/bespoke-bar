"use client";

import { pluralize } from "@bespoke/domain/utils/formatting";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { Button } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { Input } from "@bespoke/ui/Input";
import { Kbd } from "@bespoke/ui/Kbd";
import { OptionsSwitch } from "@bespoke/ui/OptionsSwitch";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { handleKey } from "@bespoke/ui/utils/keyboard";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { getIngredientUrl } from "@/features/ingredients/utils";
import {
	createIngredientSearchIndex,
	filterIngredientsByQuery,
} from "@/features/ingredients/utils/searchIngredients";
import {
	DEFAULT_SORT_DIRECTION,
	DEFAULT_SORT_FIELD,
	type IngredientSortField,
	ingredientSortDirectionSchema,
	ingredientSortFieldSchema,
	sortIngredients,
} from "@/features/ingredients/utils/sortIngredients";
import styles from "./styles.module.css";

const SORT_OPTIONS: {
	_key: string;
	value: IngredientSortField;
	label: string;
}[] = [
	{ _key: "created", value: "created", label: "Created" },
	{ _key: "updated", value: "updated", label: "Edited" },
	{ _key: "name", value: "name", label: "Name" },
];

const SKELETON_ROWS = Array.from({ length: 24 }, (_, index) => `row-${index}`);

/**
 * Callback ref on the active item that centers it within the list. Finds the
 * scroll container from the element (not a ref) because on mount the item's ref
 * fires before the container's would be set, and scrolls only that container —
 * `scrollIntoView` would also scroll the document on the detail route.
 */
function scrollActiveIntoView(element: HTMLAnchorElement | null) {
	const container = element?.closest<HTMLElement>(`.${styles.scroll}`);

	if (!element || !container) {
		return;
	}

	const containerRect = container.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();

	const delta =
		elementRect.top +
		elementRect.height / 2 -
		(containerRect.top + containerRect.height / 2);

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	container.scrollTo({
		top: container.scrollTop + delta,
		behavior: prefersReducedMotion ? "auto" : "smooth",
	});
}

export function IngredientSidebar({
	ingredients,
}: {
	ingredients: Ingredient[];
}) {
	const router = useRouter();
	const activeId = useSelectedLayoutSegment();
	const filterRef = useRef<HTMLInputElement>(null);

	const [{ sort, dir: direction }, setQuery] = useQueryStates(
		{
			sort: parseAsStringLiteral(ingredientSortFieldSchema.options).withDefault(
				DEFAULT_SORT_FIELD,
			),
			dir: parseAsStringLiteral(
				ingredientSortDirectionSchema.options,
			).withDefault(DEFAULT_SORT_DIRECTION),
		},
		{ history: "replace", scroll: false },
	);

	const [filter, setFilter] = useState("");
	const deferredFilter = useDeferredValue(filter);

	const searchIndex = useMemo(
		() => createIngredientSearchIndex(ingredients),
		[ingredients],
	);

	const visible = useMemo(() => {
		const matched = filterIngredientsByQuery(
			ingredients,
			searchIndex,
			deferredFilter,
		);

		return sortIngredients(matched, sort, direction);
	}, [ingredients, searchIndex, deferredFilter, sort, direction]);

	const descending = direction === "desc";

	return (
		<div className={styles.sidebar}>
			<Grid className={styles.header} gap={2}>
				<Input
					ref={filterRef}
					type="search"
					value={filter}
					onChange={(event) => setFilter(event.target.value)}
					onKeyDown={handleKey([
						[
							"Enter",
							() => router.push(getIngredientUrl(visible[0])),
							() => visible.length > 0,
						],
					])}
					placeholder="Name, category, or brand…"
					aria-label="Name, category, or brand"
					autoComplete="off"
					startAdornment={<Icon name="magnifying-glass" size={4} />}
					endAdornment={
						<Kbd
							shortcut="mod+f"
							onTrigger={() => filterRef.current?.focus()}
						/>
					}
					rounded
					fullWidth
				/>

				<Flex
					wrap
					justifyContent="space-between"
					alignItems="baseline"
					gap={3}
					className={styles.status}
				>
					<Text as="p" size={1} light numeric>
						{deferredFilter
							? `${visible.length} matching`
							: `${ingredients.length} ${pluralize(ingredients.length, "ingredient")}`}
					</Text>

					{visible.length > 0 ? (
						<Text as="p" size={1} light compact className="touch-hidden">
							Open first: <Kbd shortcut="Enter" visual />
						</Text>
					) : null}
				</Flex>

				<Flex gap={2} alignItems="center" justifyContent="space-between">
					<OptionsSwitch<IngredientSortField>
						legend="Sort ingredients by"
						name="ingredient-sort"
						value={sort}
						options={SORT_OPTIONS}
						onChange={(event) =>
							setQuery({
								sort: ingredientSortFieldSchema.parse(event.target.value),
							})
						}
					/>

					<Button
						icon
						variant="clear"
						color="light"
						size="small"
						aria-label={`Sort by ${sort}, ${descending ? "descending" : "ascending"}`}
						title={`Sort by ${sort}, ${descending ? "descending" : "ascending"}`}
						onClick={() => setQuery({ dir: descending ? "asc" : "desc" })}
					>
						<Icon name={descending ? "sort-down" : "sort-up"} size={3} />
					</Button>
				</Flex>
			</Grid>

			{visible.length === 0 ? (
				<Grid
					className={styles.empty}
					gap={2}
					alignContent="center"
					justifyItems="center"
				>
					<Text as="p" size={2} light align="center">
						{ingredients.length === 0
							? "No Ingredients yet."
							: "No Ingredient matches that filter."}
					</Text>

					{deferredFilter ? (
						<Button
							variant="outline"
							color="amber"
							size="tiny"
							onClick={() => setFilter("")}
						>
							Clear filter
						</Button>
					) : null}
				</Grid>
			) : (
				<nav aria-label="Ingredients" className={styles.scroll}>
					<ul>
						{visible.map((ingredient) => {
							const categoryLabel = ingredient.category
								? CATEGORY_TO_LABEL.get(ingredient.category)
								: null;

							const meta = [categoryLabel, ingredient.brand]
								.filter(Boolean)
								.join(", ");

							return (
								<li key={ingredient.id}>
									<Link
										ref={
											ingredient.id === activeId
												? scrollActiveIntoView
												: undefined
										}
										href={getIngredientUrl(ingredient)}
										prefetch={false}
										aria-current={
											ingredient.id === activeId ? "page" : undefined
										}
										className={styles.link}
									>
										<Text as="div" size={3} weight={500} truncate compact>
											{ingredient.name}
										</Text>

										{meta ? (
											<Text
												as="div"
												size={1}
												truncate
												compact
												className={styles.meta}
											>
												{meta}
											</Text>
										) : null}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			)}
		</div>
	);
}

export function IngredientSidebarSkeleton() {
	return (
		<div className={styles.sidebar} aria-hidden>
			<Grid className={styles.header} gap={2}>
				<Skeleton variant="text" height="3rem" />

				<Flex
					wrap
					justifyContent="space-between"
					alignItems="baseline"
					gap={3}
					className={styles.status}
				>
					<Skeleton variant="text" width="5rem" height="1.125rem" />

					<Skeleton
						variant="text"
						width="5rem"
						height="1.125rem"
						className="touch-hidden"
					/>
				</Flex>

				<Flex gap={2} alignItems="center" justifyContent="space-between">
					<Skeleton variant="text" width="13rem" height="2.4rem" />
					<Skeleton variant="circular" width="2rem" height="2rem" />
				</Flex>
			</Grid>

			<div className={styles.scroll}>
				<ul>
					{SKELETON_ROWS.map((key) => (
						<li key={key} className={styles.skeletonItem}>
							<Skeleton variant="text" width="13ch" height="1.15rem" />
							<Skeleton variant="text" width="6ch" height="0.8rem" />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
