import react from "@vitejs/plugin-react";

/** Vitest config for pure / server packages (no DOM). */
export const node = { test: { environment: "node" } };

/** Vitest config for React / DOM packages (jsdom + the React plugin). */
export function jsdom() {
	return { plugins: [react()], test: { environment: "jsdom" } };
}
