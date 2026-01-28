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
import useSWRImmutable from "swr/immutable";
import { EmptyArea } from "@/components/EmptyArea";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { getRecipeUrl } from "@/features/recipes/utils";
import {
	createRecipeSearchIndex,
	filterRecipes,
} from "@/features/recipes/utils/filterRecipes";
import { useOnNavigation } from "@/hooks/useOnNavigation";
import { LinkButton } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
import { Lightbox } from "@/ui/Lightbox";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import { animate, keyframes } from "@/utils/animate";
import { fetcher } from "@/utils/api";
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

	const { data: recipes, isLoading } = useSWRImmutable<RecipeWithSpecs[]>(
		"/api/recipes",
		fetcher,
	);

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

				<Text
					as="p"
					size={1}
					className={clsx(styles.shortcut, {
						[styles.disabled]: filteredRecipes.length === 0,
					})}
					align="right"
					light
				>
					Press{" "}
					<Kbd
						shortcut="mod+enter"
						onTrigger={filteredRecipes.length > 0 ? openFirstResult : undefined}
						ignoreInputEvents={false}
					/>{" "}
					to open the first result
				</Text>
			</Grid>

			<div className={styles.results}>
				{isLoading ? (
					<SkeletonScreen>
						<Grid gap={4}>
							<Skeleton width="100%" height="147px" />
							<Skeleton width="100%" height="147px" />
							<Skeleton width="100%" height="147px" />
						</Grid>
					</SkeletonScreen>
				) : filteredRecipes.length === 0 ? (
					<EmptyArea className={styles.empty}>
						<Text as="p" size={3} heavy>
							No recipes found
						</Text>
					</EmptyArea>
				) : (
					<RecipesList recipes={filteredRecipes} ref={listRef} />
				)}
			</div>

			<footer className={styles.footer}>
				<menu className={styles.actions}>
					{actions}

					<LinkButton
						variant="outline"
						color="accent"
						size="small"
						href="/bar/recipes/create"
					>
						Create Recipe
					</LinkButton>
				</menu>
			</footer>
		</Lightbox>
	);
}
