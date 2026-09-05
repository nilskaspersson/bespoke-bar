import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";

export function AuthSplash() {
	const theme = useTheme();

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<ActivityIndicator color={theme.colors.textLight} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
