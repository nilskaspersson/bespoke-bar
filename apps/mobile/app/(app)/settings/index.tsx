import { useClerk, useUser } from "@clerk/expo";
import { Button, FieldGroup, Host, Icon, ListItem, Text } from "@expo/ui";
import * as Application from "expo-application";
import { Stack } from "expo-router";
import { purgeOfflineCache } from "@/offline/purge";
import { useTheme } from "@/theme";
import { type ThemePreference, useThemePreference } from "@/theme/preference";
import { queryClient } from "@/trpc/queryClient";

const SCREEN_OPTIONS = { title: "Settings", headerLargeTitleEnabled: true };

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
];

export default function SettingsScreen() {
	const theme = useTheme();
	const { user } = useUser();
	const { signOut } = useClerk();
	const preference = useThemePreference((s) => s.preference);
	const setPreference = useThemePreference((s) => s.setPreference);

	/**
	 * Clerk drops the local session before it tells the server, so offline the
	 * sign-out still takes — it just rejects on the unreachable revocation call.
	 * Purge the cache regardless so the next signed-in user never inherits it.
	 */
	async function handleSignOut() {
		await signOut().catch(() => undefined);
		purgeOfflineCache(queryClient);
	}

	return (
		<>
			<Stack.Screen options={SCREEN_OPTIONS} />

			<Host style={{ flex: 1 }} seedColor={theme.colors.accent}>
				<FieldGroup>
					<FieldGroup.Section title="Appearance">
						{THEME_OPTIONS.map(({ value, label }) => (
							<ListItem
								key={value}
								onPress={() => setPreference(value)}
								trailing={
									preference === value ? (
										<Icon
											name="checkmark"
											size={17}
											color={theme.colors.accent}
										/>
									) : undefined
								}
							>
								<Text>{label}</Text>
							</ListItem>
						))}
					</FieldGroup.Section>

					<FieldGroup.Section title="Account">
						<ListItem supportingText={user?.primaryEmailAddress?.emailAddress}>
							<Text>Signed in</Text>
						</ListItem>
						<Button variant="text" label="Sign out" onPress={handleSignOut} />
					</FieldGroup.Section>

					<FieldGroup.Section title="About">
						<ListItem
							trailing={
								<Text>
									{`${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}
								</Text>
							}
						>
							<Text>Version</Text>
						</ListItem>
					</FieldGroup.Section>
				</FieldGroup>
			</Host>
		</>
	);
}
