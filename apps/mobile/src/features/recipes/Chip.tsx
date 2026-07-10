import { StyleSheet, Text } from "react-native";
import { fontSize, radius, space } from "../../theme/tokens";

export function Chip({
	label,
	color,
	borderColor,
}: {
	label: string;
	color: string;
	borderColor?: string;
}) {
	return (
		<Text
			numberOfLines={1}
			style={[styles.chip, { color, borderColor: borderColor ?? color }]}
		>
			{label}
		</Text>
	);
}

const styles = StyleSheet.create({
	chip: {
		paddingVertical: space[1],
		paddingHorizontal: space[3],
		borderRadius: radius.full,
		borderWidth: 1,
		fontSize: fontSize.xs,
		fontWeight: "600",
		lineHeight: fontSize.md,
		overflow: "hidden",
	},
});
