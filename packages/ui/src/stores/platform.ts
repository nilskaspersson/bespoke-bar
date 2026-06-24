import { create } from "zustand";
import type { Platform } from "../utils/keyboard";
import { detectPlatform } from "../utils/keyboard";

type PlatformState = {
	platform: Platform | undefined;
};

export const usePlatform = create<PlatformState>(() => ({
	platform: undefined,
}));

export function initializePlatform() {
	if (usePlatform.getState().platform === undefined) {
		usePlatform.setState({ platform: detectPlatform() ?? "windows" });
	}
}
