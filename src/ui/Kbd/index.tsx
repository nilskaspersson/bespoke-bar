"use client";

import { clsx } from "clsx";
import { type ComponentProps, useCallback, useEffect, useRef } from "react";
import { usePlatform } from "@/stores/platform";
import { animateChildren, keyframes } from "@/utils/animate";
import {
	isTextInputElement,
	matchesShortcut,
	parseShortcut,
} from "@/utils/keyboard";
import styles from "./styles.module.css";

type Props = {
	shortcut: string;
	onTrigger?: () => void;
	ignoreInputEvents?: boolean;
	visual?: boolean;
	variant?: "default" | "ghost";
};

export function Kbd({
	shortcut,
	onTrigger,
	ignoreInputEvents = true,
	className,
	visual,
	variant = "default",
	...props
}: ComponentProps<"kbd"> & Props) {
	const platform = usePlatform((s) => s.platform);
	const kbdRef = useRef<HTMLElement>(null);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (
				event.repeat ||
				(ignoreInputEvents && isTextInputElement(event.target)) ||
				!matchesShortcut(event, shortcut, platform) ||
				visual
			) {
				return;
			}

			/**
			 * Scope shortcuts to the nearest dialog boundary. If the Kbd lives inside a
			 * dialog, only fire when the event target is also inside that same dialog.
			 */
			const scope = kbdRef.current?.closest("dialog");

			if (scope && !scope.contains(event.target as Node)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			animateChildren(kbdRef.current, keyframes.get("pulse"));

			if (typeof onTrigger === "function") {
				onTrigger();
			} else {
				kbdRef.current?.closest<HTMLElement>("button, a[href]")?.click();
			}
		},
		[ignoreInputEvents, onTrigger, platform, shortcut, visual],
	);

	useEffect(() => {
		if (!platform || visual) {
			return;
		}

		const controller = new AbortController();

		window.addEventListener("keydown", handleKeyDown, {
			signal: controller.signal,
		});

		return () => controller.abort();
	}, [handleKeyDown, platform, visual]);

	if (!platform) {
		return null;
	}

	const keys = parseShortcut(shortcut, platform);

	return (
		<kbd ref={kbdRef} className={clsx(styles.kbd, className)} {...props}>
			{keys.map((key) => (
				<kbd key={key} className={clsx(styles.key, styles[variant])}>
					{key}
				</kbd>
			))}
		</kbd>
	);
}
