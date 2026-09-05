import { getFormattedUnit } from "@bespoke/domain/units/getFormattedUnit";
import type { IngredientLineWithIngredient } from "@bespoke/schema/schema/ingredientLines";
import { useCallback, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { useFormatters } from "@/formatters";
import { useTheme } from "@/theme";
import { fontSize, space } from "@/theme/tokens";

export function IngredientLineList({
	lines,
}: {
	lines: IngredientLineWithIngredient[];
}) {
	const [measureWidth, setMeasureWidth] = useState(0);

	const onMeasureLayout = useCallback((event: LayoutChangeEvent) => {
		const width = Math.ceil(event.nativeEvent.layout.width);
		setMeasureWidth((current) => (width > current ? width : current));
	}, []);

	return (
		<View style={styles.list}>
			{lines.map((line) => (
				<IngredientLineEntry
					key={line.id}
					line={line}
					measureWidth={measureWidth}
					onMeasureLayout={onMeasureLayout}
				/>
			))}
		</View>
	);
}

function IngredientLineEntry({
	line,
	measureWidth,
	onMeasureLayout,
}: {
	line: IngredientLineWithIngredient;
	measureWidth: number;
	onMeasureLayout: (event: LayoutChangeEvent) => void;
}) {
	const theme = useTheme();
	const { quantity } = useFormatters();

	const unit = getFormattedUnit(line.unit, line.quantity);
	const measure =
		line.quantity == null
			? unit
			: `${quantity.format(line.quantity)} ${unit}`.trimEnd();

	return (
		<View style={styles.entry}>
			<Text
				onLayout={onMeasureLayout}
				style={[
					styles.measure,
					{
						minWidth: measureWidth,
						color: theme.colors.text,
						fontFamily: theme.fonts.serif,
					},
				]}
			>
				{measure}
			</Text>

			<Text style={styles.label}>
				<Text
					style={{
						color: theme.colors.textHeavy,
						fontFamily: theme.fonts.serif,
					}}
				>
					{line.ingredient.name}
				</Text>

				{line.optional ? (
					<Text style={[styles.optional, { color: theme.colors.textLight }]}>
						{"  (optional)"}
					</Text>
				) : null}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	list: {
		gap: space[1],
	},
	entry: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: space[3],
	},
	measure: {
		fontSize: fontSize.lg,
		lineHeight: fontSize.lg * 1.15,
		fontVariant: ["tabular-nums"],
	},
	label: {
		flex: 1,
		fontSize: fontSize.lg,
		lineHeight: fontSize.lg * 1.15,
	},
	optional: {
		fontSize: fontSize.sm,
	},
});
