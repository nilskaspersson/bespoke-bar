import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { AuthSplash } from "../../src/auth/AuthSplash";
import { OrgGate } from "../../src/auth/OrgGate";

/**
 * The gate. Ordering is load-bearing: splash before the redirect (no flash of
 * the gate), and gating on `orgId` — not merely `isSignedIn` — keeps protected
 * queries from firing in the sign-in→setActive window where every call 401s.
 */
export default function AppLayout() {
	const { isLoaded, isSignedIn, orgId } = useAuth();

	if (!isLoaded) {
		return <AuthSplash />;
	}

	if (!isSignedIn) {
		return <Redirect href="/sign-in" />;
	}

	if (!orgId) {
		return <OrgGate />;
	}

	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Recipes" }} />
		</Stack>
	);
}
