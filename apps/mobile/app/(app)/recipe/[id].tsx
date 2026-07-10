import { formatLine } from "@bespoke/domain/ingredientLines/formatLine";
import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import { getRecipeCost } from "@bespoke/domain/recipes/getRecipeCost";
import {
	DEFAULT_RECIPE_NAME,
	GLASSWARE_TO_LABEL,
	ICE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@bespoke/domain/recipes/labels";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { type SFSymbol, SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { Chip } from "../../../src/features/recipes/Chip";
import { useFormatters } from "../../../src/formatters";
import { type Theme, useTheme } from "../../../src/theme";
import { fontSize, radius, space } from "../../../src/theme/tokens";
import { useTRPC } from "../../../src/trpc/client";

const SCREEN_OPTIONS = { title: "" };

export default function RecipeDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const trpc = useTRPC();
	const theme = useTheme();
	const { currency, dateTime, percentage, volume } = useFormatters();

	const { data: recipe, isPending } = useQuery(
		trpc.recipe.list.queryOptions(undefined, {
			select: (recipes) => recipes.find((r) => r.id === id),
		}),
	);

	if (!recipe) {
		return (
			<>
				<Stack.Screen options={SCREEN_OPTIONS} />
				<View style={styles.centered}>
					{isPending ? (
						<ActivityIndicator />
					) : (
						<Text style={[styles.value, { color: theme.colors.textLight }]}>
							Recipe not found
						</Text>
					)}
				</View>
			</>
		);
	}

	const metrics = calculateRecipeMetrics(recipe);
	const { cost, isIncomplete } = getRecipeCost(recipe);
	const serve = serveRows(recipe);

	return (
		<>
			<Stack.Screen options={SCREEN_OPTIONS} />

			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={styles.content}
			>
				<View style={styles.header}>
					<Text
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

					<Text style={[styles.byline, { color: theme.colors.textLight }]}>
						{dateTime.format(new Date(recipe.createdAt))}
					</Text>

					{recipe.description ? (
						<Text
							style={[
								styles.description,
								{
									color: theme.colors.text,
									fontFamily: theme.fonts.serif,
								},
							]}
						>
							{recipe.description}
						</Text>
					) : null}
				</View>

				{recipe.lines.length > 0 ? (
					<Section title="Ingredients" theme={theme}>
						<Surface theme={theme}>
							{recipe.lines.map((line) => (
								<Text
									key={line.id}
									style={[
										styles.line,
										{
											color: theme.colors.textHeavy,
											fontFamily: theme.fonts.serif,
										},
									]}
								>
									{formatLine({ ...line, name: line.ingredient.name })}
								</Text>
							))}
						</Surface>
					</Section>
				) : null}

				{recipe.garnish ? (
					<Section title="Garnish" theme={theme}>
						<Text
							style={[
								styles.line,
								{
									color: theme.colors.textHeavy,
									fontFamily: theme.fonts.serif,
								},
							]}
						>
							{recipe.garnish}
						</Text>
					</Section>
				) : null}

				{serve.length > 0 ? (
					<Section title="Serve" theme={theme}>
						<Surface theme={theme}>
							{serve.map(({ symbol, label }) => (
								<View key={symbol} style={styles.serveRow}>
									<SymbolView
										name={symbol}
										size={18}
										tintColor={theme.colors.textLight}
									/>
									<Text
										style={[styles.value, { color: theme.colors.textHeavy }]}
									>
										{label}
									</Text>
								</View>
							))}
						</Surface>
					</Section>
				) : null}

				{metrics.finalVolume > 0 ? (
					<Section title="Stats" theme={theme}>
						<Surface theme={theme}>
							<Row
								theme={theme}
								label="ABV"
								value={percentage.format(metrics.abv)}
							/>
							<Row
								theme={theme}
								label="Undiluted ABV"
								value={percentage.format(metrics.undilutedAbv)}
							/>
							<Row
								theme={theme}
								label="Final volume"
								value={`${volume.format(metrics.finalVolume)} ml`}
							/>
							<Row
								theme={theme}
								label="Dilution"
								value={percentage.format(metrics.dilutionOfFinalVolume)}
							/>
							<Row
								theme={theme}
								label="Cost per serving"
								value={`${currency.format(cost)}${isIncomplete ? "*" : ""}`}
							/>
						</Surface>

						{isIncomplete ? (
							<Text style={[styles.hint, { color: theme.colors.warning }]}>
								* Some ingredients are missing price information.
							</Text>
						) : null}
					</Section>
				) : null}

				{recipe.instructions ? (
					<Section title="Instructions" theme={theme}>
						<Text style={[styles.instructions, { color: theme.colors.text }]}>
							{recipe.instructions}
						</Text>
					</Section>
				) : null}

				{recipe.tags.length > 0 ? (
					<Section title="Tags" theme={theme}>
						<View style={styles.chips}>
							{recipe.tags.map(({ tag }) => (
								<Chip
									key={tag.id}
									label={tag.name}
									color={theme.colors.textLight}
									borderColor={theme.colors.border}
								/>
							))}
						</View>
					</Section>
				) : null}
			</ScrollView>
		</>
	);
}

function serveRows(
	recipe: RecipeWithRelations,
): { symbol: SFSymbol; label: string }[] {
	const rows: { symbol: SFSymbol; label: string }[] = [];

	if (recipe.glassware) {
		rows.push({
			symbol: "wineglass",
			label: GLASSWARE_TO_LABEL.get(recipe.glassware) ?? recipe.glassware,
		});
	}

	if (recipe.ice) {
		rows.push({
			symbol: "snowflake",
			label: ICE_TO_LABEL.get(recipe.ice) ?? recipe.ice,
		});
	}

	if (recipe.preparationMethod) {
		rows.push({
			symbol: "arrow.triangle.2.circlepath",
			label:
				METHOD_TO_LABEL.get(recipe.preparationMethod) ??
				recipe.preparationMethod,
		});
	}

	return rows;
}

function Section({
	title,
	theme,
	children,
}: {
	title: string;
	theme: Theme;
	children: ReactNode;
}) {
	return (
		<View style={styles.section}>
			<Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>
				{title.toUpperCase()}
			</Text>
			{children}
		</View>
	);
}

function Surface({ theme, children }: { theme: Theme; children: ReactNode }) {
	return (
		<View
			style={[
				styles.surface,
				{
					backgroundColor: theme.colors.surface,
					borderColor: theme.colors.borderLight,
				},
			]}
		>
			{children}
		</View>
	);
}

function Row({
	theme,
	label,
	value,
}: {
	theme: Theme;
	label: string;
	value: string;
}) {
	return (
		<View style={styles.row}>
			<Text style={[styles.label, { color: theme.colors.textLight }]}>
				{label}
			</Text>
			<Text style={[styles.value, { color: theme.colors.textHeavy }]}>
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: space[4],
		paddingBottom: space[7],
		gap: space[5],
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	header: {
		gap: space[1],
	},
	name: {
		fontSize: fontSize.h1,
		lineHeight: fontSize.h1 + 6,
	},
	byline: {
		fontSize: fontSize.sm,
	},
	description: {
		marginTop: space[2],
		fontSize: fontSize.lg,
		lineHeight: fontSize.lg * 1.5,
	},
	section: {
		gap: space[2],
	},
	sectionTitle: {
		fontSize: fontSize.xs,
		fontWeight: "600",
		letterSpacing: 0.6,
	},
	surface: {
		padding: space[4],
		borderRadius: radius.lg,
		borderWidth: StyleSheet.hairlineWidth,
		gap: space[2],
	},
	line: {
		fontSize: fontSize.lg,
		lineHeight: fontSize.lg * 1.4,
	},
	serveRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: space[3],
	},
	row: {
		flexDirection: "row",
		alignItems: "baseline",
		justifyContent: "space-between",
		gap: space[3],
	},
	label: {
		fontSize: fontSize.sm,
	},
	value: {
		fontSize: fontSize.md,
		fontWeight: "600",
	},
	hint: {
		fontSize: fontSize.xs,
	},
	instructions: {
		fontSize: fontSize.md,
		lineHeight: fontSize.md * 1.5,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: space[1],
	},
});
