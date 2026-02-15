"use client";

import { clsx } from "clsx";
import {
	type ComponentProps,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { animateChildren, keyframes } from "@/utils/animate";
import type { Platform } from "@/utils/keyboard";
import {
	detectPlatform,
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
	const [platform, setPlatform] = useState<Platform>();
	const kbdRef = useRef<HTMLElement>(null);

	useEffect(() => {
		setPlatform(detectPlatform() ?? "windows");
	}, []);

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

			event.preventDefault();

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
