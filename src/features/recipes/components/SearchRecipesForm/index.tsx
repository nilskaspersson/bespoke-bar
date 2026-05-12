"use client";

import { clsx } from "clsx";
import { usePathname, useRouter } from "next/navigation";
import {
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
import { useDialog } from "@/hooks/useDialog";
import { useOnNavigation } from "@/hooks/useOnNavigation";
import { trpc } from "@/trpc/client";
import { Button, type ButtonProps, LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
import { LightboxDialog } from "@/ui/LightboxDialog";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import { animate, keyframes } from "@/utils/animate";
import { pluralize } from "@/utils/formatting";
import styles from "./styles.module.css";

export function SearchRecipesButton({ children, ...props }: ButtonProps) {
	const { dialogRef, isOpen, showModal, closeModal } = useDialog();

	function toggleDialog() {
		if (dialogRef.current?.open) {
			closeModal();
		} else {
			showModal();
		}
	}

	return (
		<>
			<Button
				{...props}
				onClick={showModal}
				endAdornment={<Kbd shortcut="mod+k" onTrigger={toggleDialog} />}
			>
				{children}
			</Button>

			<LightboxDialog ref={dialogRef} isOpen={isOpen} className={styles.dialog}>
				<SearchRecipesForm
					actions={
						<li>
							<form method="dialog">
								<Button type="submit" variant="ghost" size="tiny">
									Cancel
								</Button>
							</form>
						</li>
					}
				/>
			</LightboxDialog>
		</>
	);
}

export function SearchRecipesForm({
	onNavigate,
	actions,
}: {
	onNavigate?: () => void;
	actions?: ReactNode;
}) {
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

	const count = deferredSearch
		? filteredRecipes.length
		: (recipes?.length ?? 0);

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
		<>
			<LightboxDialog.Header>
				<Grid gap={2}>
					<Input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Type to filter recipes…"
						autoFocus
						size={7}
						fullWidth
						rounded
						startAdornment={<Icon name="magnifying-glass" size={4} />}
						endAdornment={<Kbd shortcut="Esc" visual />}
					/>

					<div className={styles.status}>
						<Text as="p" size={1} light numeric>
							{isLoading ? (
								<Skeleton variant="text" height="1em" width="15ch" />
							) : deferredSearch ? (
								`${count} matching ${pluralize(count, "recipe")}`
							) : (
								`${count} ${pluralize(count, "recipe")}`
							)}
						</Text>

						<Text
							as="p"
							size={1}
							className={clsx(styles.shortcut, {
								[styles.disabled]: filteredRecipes.length === 0,
							})}
							light
							compact
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
					</div>
				</Grid>
			</LightboxDialog.Header>

			<div className={styles.results}>
				{isLoading ? (
					<RecipesList.Skeleton className={styles.list} />
				) : filteredRecipes.length === 0 ? (
					<EmptyArea className={styles.empty} color="light">
						<Heading level="h3" size={4}>
							No matching recipes
						</Heading>

						<Flex gap={2}>
							<Button
								variant="outline"
								color="light"
								size="small"
								onClick={() => setSearch("")}
							>
								Clear search
							</Button>

							<LinkButton
								href="/bar/recipes/create"
								variant="outline"
								color="accent"
								size="small"
							>
								Create recipe
							</LinkButton>
						</Flex>
					</EmptyArea>
				) : (
					<RecipesList
						recipes={filteredRecipes}
						ref={listRef}
						withCreate={false}
						className={styles.list}
					/>
				)}
			</div>

			{actions ? (
				<LightboxDialog.Footer>
					<menu className={styles.actions}>{actions}</menu>
				</LightboxDialog.Footer>
			) : null}
		</>
	);
}
