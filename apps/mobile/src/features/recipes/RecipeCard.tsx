import dotGrid from "@assets/textures/dot-grid.png";
import dotLeader from "@assets/textures/dot-leader.png";
import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import {
	COCKTAIL_STYLE_TO_LABEL,
	DEFAULT_RECIPE_NAME,
	GLASSWARE_TO_LABEL,
	ICE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@bespoke/domain/recipes/labels";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IngredientLineList } from "@/features/ingredientLines/IngredientLineList";
import { Chip } from "@/features/recipes/Chip";
import { EnrichmentMark } from "@/features/recipes/EnrichmentMark";
import { useFormatters } from "@/formatters";
import { type ResolvedTheme, useResolvedTheme, useTheme } from "@/theme";
import { fontSize, radius, space } from "@/theme/tokens";

const CARD_WIDTH = 400;
const CARD_RATIO = 16 / 9;

function shadow(color: string) {
	return [
		{ offsetX: 0, offsetY: 0.5, blurRadius: 0.5, color: `rgba(${color}, 0.2)` },
		{
			offsetX: 0,
			offsetY: 1,
			blurRadius: 1,
			spreadDistance: -1,
			color: `rgba(${color}, 0.15)`,
		},
		{
			offsetX: 0,
			offsetY: 2,
			blurRadius: 2,
			spreadDistance: -3,
			color: `rgba(${color}, 0.1)`,
		},
	];
}

/** The web's --shadow--low + --shadow-color pair, per resolved theme. */
const SHADOW: Record<ResolvedTheme, ReturnType<typeof shadow>> = {
	light: shadow("26, 25, 26"),
	dark: shadow("18, 17, 19"),
};

export function RecipeCard({
	recipe,
	isFavorite,
}: {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
}) {
	const theme = useTheme();
	const resolvedTheme = useResolvedTheme();
	const { percentage } = useFormatters();

	const metrics = calculateRecipeMetrics(recipe);
	const enriched = new Set(recipe.aiEnrichedFields ?? []);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${recipe.name || DEFAULT_RECIPE_NAME}${
				isFavorite ? ", favorite" : ""
			}`}
			onPress={() =>
				router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })
			}
			style={({ pressed }) => [
				styles.card,
				{
					backgroundColor: theme.colors.mauve[1],
					borderColor: theme.colors.mauve[pressed ? 5 : 4],
					boxShadow: SHADOW[resolvedTheme],
				},
			]}
		>
			<Image
				source={dotGrid}
				resizeMode="repeat"
				style={[styles.texture, { tintColor: theme.colors.mauve[5] }]}
			/>

			<View style={styles.header}>
				<View style={styles.titleLine}>
					<RecipeName recipe={recipe} />

					<Image
						source={dotLeader}
						resizeMode="repeat"
						style={[styles.leader, { tintColor: theme.colors.mauve[6] }]}
					/>

					{isFavorite ? (
						<SymbolView
							name="heart.fill"
							size={fontSize.md}
							tintColor={theme.colors.accent}
							accessibilityLabel="Favorite"
						/>
					) : null}

					<SymbolView
						name="wineglass"
						size={fontSize.md}
						tintColor={theme.colors.text}
					/>
				</View>

				<View style={styles.chips}>
					{recipe.style ? (
						<Chip icon={enriched.has("style") ? <EnrichmentMark /> : undefined}>
							{COCKTAIL_STYLE_TO_LABEL.get(recipe.style) ?? recipe.style}
						</Chip>
					) : null}

					{recipe.preparationMethod ? (
						<Chip
							icon={
								enriched.has("preparationMethod") ? (
									<EnrichmentMark />
								) : undefined
							}
						>
							{METHOD_TO_LABEL.get(recipe.preparationMethod) ??
								recipe.preparationMethod}
						</Chip>
					) : null}

					<Chip>{`${percentage.format(metrics.abv)} ABV`}</Chip>

					{recipe.glassware ? (
						<Chip
							icon={enriched.has("glassware") ? <EnrichmentMark /> : undefined}
						>
							{GLASSWARE_TO_LABEL.get(recipe.glassware) ?? recipe.glassware}
						</Chip>
					) : null}

					{recipe.ice && recipe.ice !== "none" ? (
						<Chip icon={enriched.has("ice") ? <EnrichmentMark /> : undefined}>
							{ICE_TO_LABEL.get(recipe.ice) ?? recipe.ice}
						</Chip>
					) : null}
				</View>
			</View>

			{recipe.lines.length > 0 ? (
				<IngredientLineList lines={recipe.lines} />
			) : null}

			{recipe.garnish ? (
				<Text style={[styles.garnish, { color: theme.colors.text }]}>
					<Text style={{ color: theme.colors.textHeavy }}>Garnish:</Text>{" "}
					<Text style={{ fontFamily: theme.fonts.serif }}>
						{recipe.garnish}
					</Text>
				</Text>
			) : null}
		</Pressable>
	);
}

function RecipeName({ recipe }: { recipe: RecipeWithRelations }) {
	const theme = useTheme();

	if (!recipe.name) {
		return (
			<Text
				style={[
					styles.name,
					{
						color: theme.colors.textLight,
						fontFamily: theme.fonts.serifSemiBoldItalic,
					},
				]}
			>
				{DEFAULT_RECIPE_NAME}
			</Text>
		);
	}

	return (
		<Text
			style={[
				styles.name,
				{
					color: theme.colors.textHeavy,
					fontFamily: theme.fonts.serifSemiBold,
				},
			]}
		>
			{recipe.name}
		</Text>
	);
}

const styles = StyleSheet.create({
	card: {
		minHeight: CARD_WIDTH / CARD_RATIO,
		justifyContent: "space-between",
		gap: space[4],
		padding: space[4],
		borderWidth: 1,
		borderRadius: radius.lg,
	},
	texture: {
		...StyleSheet.absoluteFill,
		borderRadius: radius.lg - 1,
	},
	header: {
		gap: space[1],
	},
	titleLine: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: space[2],
	},
	name: {
		flexShrink: 1,
		fontSize: fontSize.xl,
		lineHeight: fontSize.xl * 1.15,
	},
	leader: {
		flex: 1,
		minWidth: space[5],
		height: 2,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: space[1],
	},
	garnish: {
		fontSize: fontSize.md,
		lineHeight: fontSize.md * 1.5,
	},
});
