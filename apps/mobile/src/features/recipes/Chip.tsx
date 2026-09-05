import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import { fontSize, radius, space } from "@/theme/tokens";

const INSET = fontSize.xs / 2;

export function Chip({
	children,
	icon,
}: {
	children: string;
	icon?: ReactNode;
}) {
	const theme = useTheme();

	return (
		<View
			style={[
				styles.chip,
				{
					backgroundColor: theme.colors.background,
					borderColor: theme.colors.background,
				},
			]}
		>
			{icon}

			<Text
				numberOfLines={1}
				style={[styles.label, { color: theme.colors.textLight }]}
			>
				{children}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: space[1],
		paddingVertical: INSET / 2,
		paddingHorizontal: INSET,
		borderRadius: radius.lg,
		borderWidth: 1,
	},
	label: {
		fontSize: fontSize.xs,
		fontWeight: "600",
		lineHeight: fontSize.xs * 1.15,
	},
});
