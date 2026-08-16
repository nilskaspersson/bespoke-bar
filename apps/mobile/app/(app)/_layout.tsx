import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect } from "react";
import { AuthSplash } from "@/auth/AuthSplash";
import { OrgGate } from "@/auth/OrgGate";
import { FormattersProvider } from "@/formatters";
import { reconcileCachedSession } from "@/offline/cachedSession";
import { useTheme } from "@/theme";
import { queryClient } from "@/trpc/queryClient";

/**
 * Offline Auth is Clerk's job: its persisted resource cache resolves the last
 * verified session while disconnected, so the gate never has to reason about
 * connectivity. It only reconciles whose cache is on disk before the library
 * renders (the persisted query keys carry neither user nor org).
 */
export default function AppLayout() {
	const { isLoaded, isSignedIn, orgId, userId } = useAuth();

	useEffect(() => {
		if (orgId && userId) {
			reconcileCachedSession(userId, orgId, queryClient);
		}
	}, [orgId, userId]);

	if (!isLoaded) {
		return <AuthSplash />;
	}

	if (!isSignedIn) {
		return <Redirect href="/sign-in" />;
	}

	if (!orgId) {
		return <OrgGate />;
	}

	return <AppTabs />;
}

function AppTabs() {
	const theme = useTheme();

	return (
		<FormattersProvider>
			<NativeTabs
				minimizeBehavior="onScrollDown"
				tintColor={theme.colors.accent}
			>
				<NativeTabs.Trigger name="(recipes)">
					<NativeTabs.Trigger.Icon
						sf={{ default: "wineglass", selected: "wineglass.fill" }}
					/>
					<NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
				</NativeTabs.Trigger>

				<NativeTabs.Trigger name="settings">
					<NativeTabs.Trigger.Icon
						sf={{ default: "gearshape", selected: "gearshape.fill" }}
					/>
					<NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
				</NativeTabs.Trigger>
			</NativeTabs>
		</FormattersProvider>
	);
}
