import { useAuth } from "@clerk/expo";
import { AuthView } from "@clerk/expo/native";
import { Redirect } from "expo-router";
import { View } from "react-native";

/**
 * Clerk's native prebuilt auth UI (SwiftUI on iOS). It owns the whole sign-in /
 * sign-up flow — password, email codes, OAuth, client trust, MFA — and syncs the
 * session into the JS SDK, so `useAuth()` flips and the gate takes over. Once
 * signed in we leave this route; the (app) gate resolves the org from there.
 */
export default function SignInScreen() {
	const { isSignedIn } = useAuth();

	if (isSignedIn) {
		return <Redirect href="/" />;
	}

	return (
		<View style={{ flex: 1 }}>
			<AuthView mode="signInOrUp" />
		</View>
	);
}
