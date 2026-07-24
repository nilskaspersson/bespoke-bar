import { SymbolView } from "expo-symbols";
import {
	Alert,
	Linking,
	Pressable,
	StyleSheet,
	Text,
	useColorScheme,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { dark, light } from "@/theme/colors";
import { fontSize, space } from "@/theme/tokens";
import { useUpdateRequired } from "@/trpc/updateRequired";

/**
 * Placeholder until stage 6 creates the TestFlight group and fills in the real
 * invite link. `itms-beta://` opens the TestFlight app, a serviceable default
 * for internal testers.
 */
const TESTFLIGHT_URL = "itms-beta://";

/**
 * A persistent, dismissable notice raised once the server reports this binary
 * is below the min-version floor (ADR-0009). Deliberately NOT a hard wall — the
 * cached library keeps rendering and only fresh data is out of reach until the
 * app is updated (a hard block stays reserved for security / contract
 * retirement). It sits as an in-flow bar ABOVE the whole navigator (so it never
 * covers the large-title header or its search bar) and, like the web's
 * notifications, inverts the colour scheme so it reads as a distinct surface.
 */
export function UpdateBanner() {
	const show = useUpdateRequired((s) => s.updateRequired && !s.dismissed);
	const dismiss = useUpdateRequired((s) => s.dismiss);
	const theme = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();

	if (!show) {
		return null;
	}

	const inverted = scheme === "dark" ? light : dark;

	async function onUpdate() {
		try {
			if (!(await Linking.canOpenURL(TESTFLIGHT_URL))) {
				throw new Error("no handler");
			}
			await Linking.openURL(TESTFLIGHT_URL);
		} catch {
			Alert.alert(
				"Can't open TestFlight",
				"Install TestFlight from the App Store to get the latest build.",
			);
		}
	}

	return (
		<View
			style={{
				paddingTop: insets.top,
				backgroundColor: theme.colors.background,
			}}
		>
			<View style={[styles.bar, { backgroundColor: inverted.surface }]}>
				<SymbolView
					name="arrow.down.circle"
					size={fontSize.md}
					tintColor={inverted.accent}
				/>
				<Text
					style={[styles.message, { color: inverted.text }]}
					numberOfLines={2}
				>
					You're viewing saved recipes. Update to sync new changes.
				</Text>
				<Pressable
					accessibilityRole="button"
					hitSlop={8}
					onPress={onUpdate}
					style={pressedOpacity}
				>
					<Text style={[styles.action, { color: inverted.accent }]}>
						Update
					</Text>
				</Pressable>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Dismiss"
					hitSlop={8}
					onPress={dismiss}
					style={pressedOpacity}
				>
					<SymbolView
						name="xmark"
						size={fontSize.md}
						tintColor={inverted.textLight}
					/>
				</Pressable>
			</View>
		</View>
	);
}

function pressedOpacity({ pressed }: { pressed: boolean }) {
	return pressed ? styles.pressed : undefined;
}

const styles = StyleSheet.create({
	bar: {
		flexDirection: "row",
		alignItems: "center",
		gap: space[3],
		paddingVertical: space[3],
		paddingHorizontal: space[4],
	},
	message: {
		flex: 1,
		fontSize: fontSize.sm,
		lineHeight: 18,
	},
	action: {
		fontSize: fontSize.sm,
		fontWeight: "600",
	},
	pressed: {
		opacity: 0.6,
	},
});
