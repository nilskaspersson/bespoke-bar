"use client";

import { type RefObject, useCallback, useEffect } from "react";
import { usePlatform } from "../stores/platform";
import { isTextInputElement, matchesShortcut } from "../utils/keyboard";

type Options = {
	ignoreInputEvents?: boolean;
	scopeRef?: RefObject<HTMLElement | null>;
	enabled?: boolean;
};

/**
 * Registers a window keydown listener that fires `onTrigger` when the `shortcut`
 * pattern matches.
 */
export function useShortcut(
	shortcut: string,
	onTrigger: () => void,
	{ ignoreInputEvents = true, scopeRef, enabled = true }: Options = {},
) {
	const platform = usePlatform((s) => s.platform);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (
				event.repeat ||
				(ignoreInputEvents && isTextInputElement(event.target)) ||
				!matchesShortcut(event, shortcut, platform)
			) {
				return;
			}

			/**
			 * Scope shortcuts to the nearest dialog boundary. If the caller provides a ref
			 * inside a dialog, only fire when the target is also inside the same dialog.
			 */
			const scope = scopeRef?.current?.closest("dialog");
			if (scope && !scope.contains(event.target as Node)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			onTrigger();
		},
		[ignoreInputEvents, scopeRef, onTrigger, platform, shortcut],
	);

	useEffect(() => {
		if (!enabled || !platform) {
			return;
		}

		const controller = new AbortController();
		window.addEventListener("keydown", handleKeyDown, {
			signal: controller.signal,
		});
		return () => controller.abort();
	}, [enabled, handleKeyDown, platform]);
}
