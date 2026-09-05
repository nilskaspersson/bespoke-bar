"use client";

import {
	applyRecipeFilters,
	createRecipeSearchIndex,
} from "@bespoke/domain/recipes/applyRecipeFilters";
import { getRecipeUrl } from "@bespoke/domain/recipes/getRecipeUrl";
import { pluralize } from "@bespoke/domain/utils/formatting";
import { Button, type ButtonProps, LinkButton } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { useOnNavigation } from "@bespoke/ui/hooks/useOnNavigation";
import { useShortcut } from "@bespoke/ui/hooks/useShortcut";
import { Icon } from "@bespoke/ui/Icon";
import { Input } from "@bespoke/ui/Input";
import { Kbd } from "@bespoke/ui/Kbd";
import { LightboxDialog } from "@bespoke/ui/LightboxDialog";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { animate, keyframes } from "@bespoke/ui/utils/animate";
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
import { trpc } from "@/trpc/client";
import styles from "./styles.module.css";

export function SearchRecipesButton({
	children,
	onClick,
	...props
}: ButtonProps) {
	const { dialogRef, isOpen, showModal, closeModal } = useDialog();

	const toggleDialog = useCallback(() => {
		if (dialogRef.current?.open) {
			closeModal();
		} else {
			showModal();
		}
	}, [dialogRef, closeModal, showModal]);

	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		onClick?.(event);
		showModal();
	}

	useShortcut("mod+k", toggleDialog);

	return (
		<>
			<Button {...props} onClick={handleClick}>
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

function SearchRecipesForm({
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
		() =>
			applyRecipeFilters(recipes ?? [], searchIndex, {
				query: deferredSearch,
				favoriteIdSet: null,
				selectedTagIds: [],
				selectedStyles: [],
			}),
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
				<Heading level="h3" className={styles.heading}>
					Quick search <Kbd shortcut="mod+k" visual />
				</Heading>

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
						<Heading level="h4" size={4}>
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
								href="/recipes/create"
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
