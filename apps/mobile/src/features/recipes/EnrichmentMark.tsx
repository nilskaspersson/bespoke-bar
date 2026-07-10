import { SymbolView } from "expo-symbols";
import { StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { fontSize } from "@/theme/tokens";

export function EnrichmentMark() {
	const theme = useTheme();

	return (
		<SymbolView
			name="sparkles"
			size={fontSize.xs}
			tintColor={theme.colors.text}
			style={styles.mark}
			accessibilityLabel="Auto-filled"
		/>
	);
}

const styles = StyleSheet.create({
	mark: {
		opacity: 0.5,
	},
});
