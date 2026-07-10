import { useClerk } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { View } from "react-native";
import { apiOrigin } from "../trpc/client";
import {
	AuthScreen,
	BodyText,
	Heading,
	PrimaryButton,
	TextButton,
} from "./primitives";

/**
 * `isSignedIn && !orgId` with zero (or, defensively, more than one) memberships.
 * The app never creates orgs — web `/setup` is the single home of personal-org
 * creation (ADR-0011). After the user finishes there, the next foreground
 * refreshes the session and the gate resolves the org on its own.
 */
export function SetupWall() {
	const { signOut } = useClerk();

	return (
		<AuthScreen>
			<Heading>Finish setup on the web</Heading>
			<BodyText>
				Your account isn't part of a bar yet. Create one on the web, then come
				back — you'll be signed in and ready.
			</BodyText>
			<View style={{ gap: 12 }}>
				<PrimaryButton
					label="Open setup in browser"
					onPress={() => WebBrowser.openBrowserAsync(`${apiOrigin}/setup`)}
				/>
				<TextButton label="Sign out" onPress={() => signOut()} />
			</View>
		</AuthScreen>
	);
}
