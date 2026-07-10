import {
	applyRecipeFilters,
	createRecipeSearchIndex,
} from "@bespoke/domain/recipes/applyRecipeFilters";
import { getAppErrorMessage } from "@bespoke/schema/appError";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	type NativeSyntheticEvent,
	StyleSheet,
	Text,
	type TextInputFocusEventData,
	View,
} from "react-native";
import { RecipeCard } from "../../src/features/recipes/RecipeCard";
import { useTheme } from "../../src/theme";
import { fontSize, space } from "../../src/theme/tokens";
import { getAppErrorPayload } from "../../src/trpc/appError";
import { useTRPC } from "../../src/trpc/client";

function keyExtractor(recipe: RecipeWithRelations): string {
	return recipe.id;
}

export default function RecipesScreen() {
	const trpc = useTRPC();
	const theme = useTheme();
	const [query, setQuery] = useState("");

	const recipes = useQuery(trpc.recipe.list.queryOptions());
	const favorites = useQuery(trpc.favorite.list.queryOptions());

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

			{recipes.isPending ? (
				<Centered>
					<ActivityIndicator />
				</Centered>
			) : recipes.error ? (
				<Centered>
					<Text style={[styles.message, { color: theme.colors.error }]}>
						{errorMessage(recipes.error)}
					</Text>
				</Centered>
			) : (
				<FlatList
					data={filteredRecipes}
					keyExtractor={keyExtractor}
					renderItem={renderItem}
					contentInsetAdjustmentBehavior="automatic"
					contentContainerStyle={styles.list}
					keyboardDismissMode="on-drag"
					ListEmptyComponent={
						<Centered>
							<Text style={[styles.message, { color: theme.colors.textLight }]}>
								No recipes match
							</Text>
						</Centered>
					}
				/>
			)}
		</>
	);
}

function Centered({ children }: { children: React.ReactNode }) {
	return <View style={styles.centered}>{children}</View>;
}

function errorMessage(error: { message: string }): string {
	const payload = getAppErrorPayload(error);
	return payload ? getAppErrorMessage(payload) : error.message;
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
