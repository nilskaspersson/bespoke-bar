"use client";

import { useEffect, useRef } from "react";
import { Toaster as SonnerToaster } from "sonner";
import type { ResolvedTheme } from "@/app/_theme/constants";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/ui/Icon";
import { Spinner } from "@/ui/Spinner";

const ICONS_MAP = {
	success: <Icon name="check" size={3} />,
	info: <Icon name="circle-info" size={3} />,
	warning: <Icon name="circle-exclamation" size={3} />,
	error: <Icon name="triangle-exclamation" size={3} />,
	loading: <Spinner size={5} />,
	close: <Icon name="xmark" size={2} />,
} as const;

const INVERTED: Record<ResolvedTheme, ResolvedTheme> = {
	light: "dark",
	dark: "light",
};

function promoteToTopLayer(toaster: HTMLElement) {
	if (toaster.getAttribute("popover") !== "manual") {
		toaster.setAttribute("popover", "manual");
	}

	try {
		if (toaster.matches(":popover-open")) {
			toaster.hidePopover();
		}
		toaster.showPopover();
	} catch {
		// showPopover throws if the element detached between query and call.
	}
}

export function Toaster() {
	const { resolvedTheme } = useTheme();
	const rootRef = useRef<HTMLDivElement>(null);

	/**
	 * Promote toaster to the top layer whenever a toast is appended. This keeps
	 * notifications over dialogs.
	 */
	useEffect(() => {
		const root = rootRef.current;
		if (!root) {
			return;
		}

		const existing = root.querySelector<HTMLElement>("[data-sonner-toaster]");
		if (existing) {
			promoteToTopLayer(existing);
		}

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (!(node instanceof HTMLElement)) {
						continue;
					}
					const toaster = node.matches("[data-sonner-toaster]")
						? node
						: node.querySelector<HTMLElement>("[data-sonner-toaster]");
					if (toaster) {
						promoteToTopLayer(toaster);
					}
				}
			}
		});

		observer.observe(root, { childList: true });
		return () => observer.disconnect();
	}, []);

	return (
		<SonnerToaster
			ref={rootRef}
			position="top-right"
			closeButton
			icons={ICONS_MAP}
			theme={INVERTED[resolvedTheme]}
		/>
	);
}
