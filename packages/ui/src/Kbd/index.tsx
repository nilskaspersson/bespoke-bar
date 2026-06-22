"use client";

import { clsx } from "clsx";
import { type ComponentProps, useCallback, useRef } from "react";
import { useShortcut } from "../hooks/useShortcut";
import { usePlatform } from "../stores/platform";
import { animateChildren, keyframes } from "../utils/animate";
import { parseShortcut } from "../utils/keyboard";
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

	const handleTrigger = useCallback(() => {
		animateChildren(kbdRef.current, keyframes.get("pulse"));

		if (typeof onTrigger === "function") {
			onTrigger();
		} else {
			kbdRef.current?.closest<HTMLElement>("button, a[href]")?.click();
		}
	}, [onTrigger]);

	useShortcut(shortcut, handleTrigger, {
		ignoreInputEvents,
		scopeRef: kbdRef,
		enabled: !visual,
	});

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
