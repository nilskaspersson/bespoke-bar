"use client";

import { clsx } from "clsx";
import { usePathname, useRouter } from "next/navigation";
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useDeferredValue,
	useMemo,
	useRef,
	useState,
} from "react";
import { EmptyArea } from "@/components/EmptyArea";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { getRecipeUrl } from "@/features/recipes/utils";
import {
	createRecipeSearchIndex,
	filterRecipes,
} from "@/features/recipes/utils/filterRecipes";
import { useOnNavigation } from "@/hooks/useOnNavigation";
import { trpc } from "@/trpc/client";
import { Button, LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
import { Lightbox } from "@/ui/Lightbox";
import { Text } from "@/ui/Text";
import { animate, keyframes } from "@/utils/animate";
import styles from "./styles.module.css";

export function SearchRecipesForm({
	className,
	onNavigate,
	actions,
	...props
}: { onNavigate?: () => void; actions?: ReactNode } & ComponentProps<
	typeof Lightbox
>) {
	const { push } = useRouter();
	const pathname = usePathname();

	const listRef = useRef<HTMLUListElement>(null);

	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	useOnNavigation(onNavigate);

	const { data: recipes, isLoading } = trpc.recipe.list.useQuery();

	const searchIndex = useMemo(
		() => createRecipeSearchIndex(recipes),
		[recipes],
	);

	const filteredRecipes = useMemo(
		() => filterRecipes(recipes, searchIndex, deferredSearch),
		[deferredSearch, recipes, searchIndex],
	);

	const openFirstResult = useCallback(() => {
		if (filteredRecipes.length === 0) {
			return;
		}

		const recipeUrl = getRecipeUrl(filteredRecipes[0]);

		/**
		 * No need to send a network request if the route didn't change
		 */
		if (pathname !== recipeUrl) {
			animate(listRef.current?.firstElementChild, keyframes.get("press"));
			push(recipeUrl);
		} else {
			/**
			 * But still trigger the navigation callback, to match user intent
			 */
			onNavigate?.();
		}
	}, [filteredRecipes, pathname, push, onNavigate]);

	return (
		<Lightbox {...props} className={clsx(styles.lightbox, className)}>
			<Grid as="header" gap={2} className={styles.header}>
				<div className={styles.search}>
					<Icon
						name="magnifying-glass"
						size={4}
						className={styles.searchIcon}
					/>

					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Type to filter recipes…"
						fullWidth
						autoFocus
						rounded
						size={7}
						className={styles.searchInput}
					/>

					<Kbd shortcut="Esc" visual className={styles.esc} />
				</div>

				<Flex justifyContent="space-between">
					<Text as="p" size={1} light numeric>
						{filteredRecipes.length} matching{" "}
						{filteredRecipes.length === 1 ? "recipe" : "recipes"}
					</Text>

					<Text
						as="p"
						size={1}
						className={clsx(styles.shortcut, {
							[styles.disabled]: filteredRecipes.length === 0,
						})}
						light
					>
						Press{" "}
						<Kbd
							shortcut="mod+enter"
							onTrigger={
								filteredRecipes.length > 0 ? openFirstResult : undefined
							}
							ignoreInputEvents={false}
						/>{" "}
						to open the first result
					</Text>
				</Flex>
			</Grid>

			<div className={styles.results}>
				{isLoading ? (
					<RecipesList.Skeleton />
				) : filteredRecipes.length === 0 ? (
					<EmptyArea className={styles.empty} color="light">
						<Heading level="h3" size={4}>
							No recipes found
						</Heading>

						<Flex as="menu" gap={2} wrap justifyContent="center">
							<li>
								<LinkButton
									href="/bar/recipes/create"
									variant="solid"
									color="accent"
									size="small"
								>
									Create recipe
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
					<RecipesList
						recipes={filteredRecipes}
						ref={listRef}
						withMotion={false}
					/>
				)}
			</div>

			{actions ? (
				<footer className={styles.footer}>
					<menu className={styles.actions}>{actions}</menu>
				</footer>
			) : null}
		</Lightbox>
	);
}
