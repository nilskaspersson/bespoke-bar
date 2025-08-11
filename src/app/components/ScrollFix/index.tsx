"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * This infuriating piece of code is necessary to ensure that the page scrolls to
 * the top on navigation. It preserves scroll position when using browser
 * navigation. I don't know why this is necessary, it seems like Next.js sometimes
 * loses track of the height of the document during navigation when whatever
 * mechanism they use to scroll is triggered.
 */
export function ScrollFix() {
	const pathname = usePathname();
	const isStatePopped = useRef(false);

	useEffect(() => {
		const controller = new AbortController();

		const onPopState = () => {
			isStatePopped.current = true;
		};

		window.addEventListener("popstate", onPopState, {
			signal: controller.signal,
		});

		return () => controller.abort();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: We explicitly want to subscribe to pathname changes
	useEffect(() => {
		if (!isStatePopped.current) {
			window.scrollTo(0, 0);

			/**
			 * The small-screen navigation sidebar depends on focus to determine open state.
			 * By blurring the active element here, we get to close it automatically on
			 * navigation.
			 */
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		} else {
			isStatePopped.current = false;
		}
	}, [pathname]);

	return null;
}
