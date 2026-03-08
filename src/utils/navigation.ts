"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

type Callback = () => void;

const listeners = new Set<Callback>();

/**
 * Subscribe to client-side navigations. Returns an unsubscribe function.
 * Requires `<NavigationObserver />` to be mounted once in the tree.
 */
export function onNavigation(cb: Callback): () => void {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

/**
 * Singleton component, bridges `usePathname()` to the `onNavigation` registry.
 */
export function NavigationObserver() {
	const pathname = usePathname();
	const prev = useRef(pathname);

	useLayoutEffect(() => {
		if (pathname === prev.current) {
			return;
		}

		console.log("navigation", listeners);

		prev.current = pathname;

		for (const cb of listeners) {
			cb();
		}
	}, [pathname]);

	return null;
}
