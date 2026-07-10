import type { ReactNode } from "react";
import {
	ActivityIndicator,
	Pressable,
	type PressableProps,
	StyleSheet,
	Text,
	View,
} from "react-native";

export function AuthScreen({ children }: { children: ReactNode }) {
	return <View style={styles.screen}>{children}</View>;
}

export function Heading({ children }: { children: ReactNode }) {
	return <Text style={styles.heading}>{children}</Text>;
}

export function BodyText({ children }: { children: ReactNode }) {
	return <Text style={styles.body}>{children}</Text>;
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
	const inactive = disabled || loading;
	return (
		<Pressable
			accessibilityRole="button"
			disabled={inactive}
			style={({ pressed }) => [
				styles.primary,
				inactive && styles.disabled,
				pressed && styles.pressed,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator color="#FFFFFF" />
			) : (
				<Text style={styles.primaryLabel}>{label}</Text>
			)}
		</Pressable>
	);
}

export function TextButton({ label, ...props }: Omit<ButtonProps, "loading">) {
	return (
		<Pressable accessibilityRole="button" hitSlop={8} {...props}>
			<Text style={styles.textButtonLabel}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 24,
		justifyContent: "center",
		gap: 16,
	},
	heading: {
		fontSize: 28,
		fontWeight: "700",
		color: "#111827",
	},
	body: {
		fontSize: 15,
		lineHeight: 22,
		color: "#4B5563",
	},
	primary: {
		height: 48,
		borderRadius: 10,
		backgroundColor: "#007AFF",
		alignItems: "center",
		justifyContent: "center",
	},
	primaryLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	textButtonLabel: {
		fontSize: 15,
		color: "#007AFF",
		textAlign: "center",
	},
	disabled: {
		opacity: 0.5,
	},
	pressed: {
		opacity: 0.85,
	},
});
