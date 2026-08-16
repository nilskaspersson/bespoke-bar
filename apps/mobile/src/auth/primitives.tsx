import type { ReactNode } from "react";
import {
	ActivityIndicator,
	Pressable,
	type PressableProps,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useTheme } from "@/theme";
import { fontSize, radius, space } from "@/theme/tokens";

export function AuthScreen({ children }: { children: ReactNode }) {
	const theme = useTheme();

	return (
		<View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
			{children}
		</View>
	);
}

export function Heading({ children }: { children: ReactNode }) {
	const theme = useTheme();

	return (
		<Text style={[styles.heading, { color: theme.colors.textHeavy }]}>
			{children}
		</Text>
	);
}

export function BodyText({ children }: { children: ReactNode }) {
	const theme = useTheme();

	return (
		<Text style={[styles.body, { color: theme.colors.text }]}>{children}</Text>
	);
}

type ButtonProps = Omit<PressableProps, "children"> & {
	label: string;
	loading?: boolean;
};

export function PrimaryButton({
	label,
	loading = false,
	disabled,
	...props
}: ButtonProps) {
	const theme = useTheme();
	const inactive = disabled || loading;

	return (
		<Pressable
			accessibilityRole="button"
			disabled={inactive}
			style={({ pressed }) => [
				styles.primary,
				{ backgroundColor: theme.colors.accent },
				inactive && styles.disabled,
				pressed && styles.pressed,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator color={theme.colors.surface} />
			) : (
				<Text style={[styles.primaryLabel, { color: theme.colors.surface }]}>
					{label}
				</Text>
			)}
		</Pressable>
	);
}

export function TextButton({ label, ...props }: Omit<ButtonProps, "loading">) {
	const theme = useTheme();

	return (
		<Pressable accessibilityRole="button" hitSlop={8} {...props}>
			<Text style={[styles.textButtonLabel, { color: theme.colors.accent }]}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		paddingHorizontal: space[5],
		justifyContent: "center",
		gap: space[4],
	},
	heading: {
		fontSize: fontSize.h2,
		fontWeight: "700",
	},
	body: {
		fontSize: fontSize.md,
		lineHeight: fontSize.md * 1.5,
	},
	primary: {
		height: 48,
		borderRadius: radius.lg,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryLabel: {
		fontSize: fontSize.md,
		fontWeight: "600",
	},
	textButtonLabel: {
		fontSize: fontSize.md,
		textAlign: "center",
	},
	disabled: {
		opacity: 0.5,
	},
	pressed: {
		opacity: 0.85,
	},
});
