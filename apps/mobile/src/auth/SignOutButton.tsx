import { useClerk } from "@clerk/expo";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";
import { purgeOfflineCache } from "@/offline/purge";
import { useTheme } from "@/theme";
import { queryClient } from "@/trpc/queryClient";

export function SignOutButton() {
	const { signOut } = useClerk();
	const theme = useTheme();

	/**
	 * Clerk drops the local session before it tells the server, so offline the
	 * sign-out still takes — it just rejects on the unreachable revocation call.
	 * Purge the cache regardless so the next signed-in user never inherits it.
	 */
	async function handlePress() {
		await signOut().catch(() => undefined);
		purgeOfflineCache(queryClient);
	}

	return (
		<Pressable onPress={handlePress} hitSlop={8}>
			<SymbolView
				name="rectangle.portrait.and.arrow.right"
				size={22}
				tintColor={theme.colors.accent}
			/>
		</Pressable>
	);
}
