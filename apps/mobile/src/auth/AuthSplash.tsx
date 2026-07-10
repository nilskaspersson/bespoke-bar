import { ActivityIndicator, StyleSheet, View } from "react-native";

export function AuthSplash() {
	return (
		<View style={styles.container}>
			<ActivityIndicator />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
});
