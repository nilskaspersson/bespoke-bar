import { Stack } from "expo-router";
import { useTheme } from "@/theme";

export default function RecipesLayout() {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		/>
	);
}
