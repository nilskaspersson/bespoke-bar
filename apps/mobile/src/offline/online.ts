import { focusManager, onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState } from "react-native";

/**
 * Leave onlineManager at its default (online) and only flip it on a real OS
 * event: a wrongly-latched offline state pauses every query with no way back,
 * whereas trusting online at worst fires a request that fails fast and refetches
 * on reconnect or foreground. Reachability drives the UI off actual query
 * failure, not this signal — this only earns the automatic refetch on reconnect.
 */
onlineManager.setEventListener((setOnline) => {
	const subscription = Network.addNetworkStateListener((state) => {
		setOnline(state.isConnected === true);
	});
	return () => subscription.remove();
});

AppState.addEventListener("change", (status) => {
	focusManager.setFocused(status === "active");
});
