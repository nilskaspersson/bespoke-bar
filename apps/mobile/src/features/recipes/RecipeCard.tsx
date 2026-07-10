import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import { getRecipeCost } from "@bespoke/domain/recipes/getRecipeCost";
import {
	DEFAULT_RECIPE_NAME,
	getCocktailStyleLabel,
} from "@bespoke/domain/recipes/labels";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFormatters } from "../../formatters";
import { useTheme } from "../../theme";
import { fontSize, radius, space } from "../../theme/tokens";
import { Chip } from "./Chip";

export function RecipeCard({
	recipe,
	isFavorite,
}: {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
}) {
	const theme = useTheme();
	const { currency, percentage, volume } = useFormatters();

	const metrics = calculateRecipeMetrics(recipe);
	const { cost, isIncomplete } = getRecipeCost(recipe);

	return (
		<Pressable
			accessibilityRole="button"
			onPress={() =>
				router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })
			}
			style={({ pressed }) => [
				styles.card,
				{
					backgroundColor: theme.colors.surface,
					borderColor: theme.colors.borderLight,
				},
				pressed && styles.pressed,
			]}
		>
			<View style={styles.titleRow}>
				<Text
					numberOfLines={2}
					style={[
						styles.name,
						{
							color: theme.colors.textHeavy,
							fontFamily: theme.fonts.serifSemiBold,
						},
					]}
				>
					{recipe.name || DEFAULT_RECIPE_NAME}
				</Text>

				{isFavorite ? (
					<SymbolView
						name="heart.fill"
						size={16}
						tintColor={theme.colors.accent}
						accessibilityLabel="Favorite"
					/>
				) : null}
			</View>

			{recipe.style || recipe.tags.length > 0 ? (
				<View style={styles.chips}>
					{recipe.style ? (
						<Chip
							label={getCocktailStyleLabel(recipe.style)}
							color={theme.colors.styleHue[recipe.style]}
						/>
					) : null}

					{recipe.tags.map(({ tag }) => (
						<Chip
							key={tag.id}
							label={tag.name}
							color={theme.colors.textLight}
							borderColor={theme.colors.border}
						/>
					))}
				</View>
			) : null}

			{metrics.finalVolume > 0 ? (
				<View style={styles.metrics}>
					<Metric value={percentage.format(metrics.abv)} label="ABV" />
					<Metric value={`${volume.format(metrics.finalVolume)} ml`} />
					{isIncomplete ? null : <Metric value={currency.format(cost)} />}
				</View>
			) : null}
		</Pressable>
	);
}

function Metric({ value, label }: { value: string; label?: string }) {
	const theme = useTheme();

	return (
		<Text style={[styles.metric, { color: theme.colors.textLight }]}>
			<Text style={{ color: theme.colors.text, fontWeight: "600" }}>
				{value}
			</Text>
			{label ? ` ${label}` : null}
		</Text>
	);
}

const styles = StyleSheet.create({
	card: {
		padding: space[4],
		borderRadius: radius.lg,
		borderWidth: StyleSheet.hairlineWidth,
		gap: space[2],
	},
	pressed: {
		opacity: 0.7,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space[3],
	},
	name: {
		flexShrink: 1,
		fontSize: fontSize.xl,
		lineHeight: fontSize.h2 + 2,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: space[1],
	},
	metrics: {
		flexDirection: "row",
		flexWrap: "wrap",
		columnGap: space[4],
		rowGap: space[1],
	},
	metric: {
		fontSize: fontSize.sm,
	},
});
