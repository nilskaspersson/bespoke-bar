import {
	applyRecipeFilters,
	createRecipeSearchIndex,
} from "@bespoke/domain/recipes/applyRecipeFilters";
import { getAppErrorMessage } from "@bespoke/schema/appError";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import type { FetchStatus, QueryStatus } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	type NativeSyntheticEvent,
	RefreshControl,
	StyleSheet,
	Text,
	type TextInputFocusEventData,
	View,
} from "react-native";
import { SignOutButton } from "@/auth/SignOutButton";
import { RecipeCard } from "@/features/recipes/RecipeCard";
import { usePlaceholderPhase } from "@/offline/usePlaceholderPhase";
import { useSyncedAgoLabel } from "@/offline/useSyncedAgoLabel";
import { useTheme } from "@/theme";
import { fontSize, space } from "@/theme/tokens";
import { getAppErrorPayload } from "@/trpc/appError";
import { useTRPC } from "@/trpc/client";

function keyExtractor(recipe: RecipeWithRelations): string {
	return recipe.id;
}

export default function RecipesScreen() {
	const trpc = useTRPC();
	const theme = useTheme();
	const [query, setQuery] = useState("");

	const recipes = useQuery(trpc.recipe.list.queryOptions());
	const favorites = useQuery(trpc.favorite.list.queryOptions());

	const [isRefreshing, setIsRefreshing] = useState(false);
	const syncedAgoLabel = useSyncedAgoLabel(recipes.dataUpdatedAt);

	async function onRefresh() {
		setIsRefreshing(true);
		await Promise.all([recipes.refetch(), favorites.refetch()]).catch(
			() => undefined,
		);
		setIsRefreshing(false);
	}

	const onChangeText = useCallback(
		(event: NativeSyntheticEvent<TextInputFocusEventData>) =>
			setQuery(event.nativeEvent.text),
		[],
	);

	const screenOptions = useMemo(
		() => ({
			title: "Recipes",
			headerLargeTitleEnabled: true,
			headerLargeStyle: { backgroundColor: theme.colors.background },
			headerRight: () => <SignOutButton />,
			headerSearchBarOptions: {
				placeholder: "Recipe or ingredient",
				autoCapitalize: "none" as const,
				onChangeText,
			},
		}),
		[onChangeText, theme.colors.background],
	);

	const searchIndex = useMemo(
		() => createRecipeSearchIndex(recipes.data),
		[recipes.data],
	);

	const favoriteIds = useMemo(
		() => new Set(favorites.data ?? []),
		[favorites.data],
	);

	const filteredRecipes = useMemo(
		() =>
			applyRecipeFilters(recipes.data ?? [], searchIndex, {
				query,
				favoriteIdSet: null,
				selectedTagIds: [],
				selectedStyles: [],
			}),
		[recipes.data, searchIndex, query],
	);

	const renderItem = useCallback(
		({ item }: { item: RecipeWithRelations }) => (
			<RecipeCard recipe={item} isFavorite={favoriteIds.has(item.id)} />
		),
		[favoriteIds],
	);

	return (
		<>
			<Stack.Screen options={screenOptions} />

			<FlatList
				data={filteredRecipes}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={styles.list}
				keyboardDismissMode="on-drag"
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={onRefresh}
						title={syncedAgoLabel}
						tintColor={theme.colors.textLight}
						titleColor={theme.colors.textLight}
					/>
				}
				ListEmptyComponent={
					<ListPlaceholder
						status={recipes.status}
						fetchStatus={recipes.fetchStatus}
						error={recipes.error}
					/>
				}
			/>
		</>
	);
}

/**
 * iOS resolves the nav bar's tracked scroll view by walking the first-subview
 * chain, and only applies the large title's content inset to a scroll view that
 * exists at first layout — so the list must mount unconditionally, and the
 * loading, error and empty states must live inside it.
 */
function ListPlaceholder({
	status,
	fetchStatus,
	error,
}: {
	status: QueryStatus;
	fetchStatus: FetchStatus;
	error: { message: string } | null;
}) {
	const theme = useTheme();
	const phase = usePlaceholderPhase(status, fetchStatus);

	if (phase === "blank") {
		return null;
	}

	if (phase === "loading") {
		return (
			<Centered>
				<ActivityIndicator />
			</Centered>
		);
	}

	const appError = error && getAppErrorPayload(error);
	if (phase === "offline" || (error && !appError)) {
		return (
			<Centered>
				<Text style={[styles.message, { color: theme.colors.textLight }]}>
					Can't reach the server right now.
				</Text>
			</Centered>
		);
	}

	if (appError) {
		return (
			<Centered>
				<Text style={[styles.message, { color: theme.colors.error }]}>
					{getAppErrorMessage(appError)}
				</Text>
			</Centered>
		);
	}

	return (
		<Centered>
			<Text style={[styles.message, { color: theme.colors.textLight }]}>
				No recipes match
			</Text>
		</Centered>
	);
}

function Centered({ children }: { children: React.ReactNode }) {
	return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
	list: {
		flexGrow: 1,
		padding: space[4],
		gap: space[3],
	},
	centered: {
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: space[5],
	},
	message: {
		fontSize: fontSize.md,
		textAlign: "center",
	},
});
