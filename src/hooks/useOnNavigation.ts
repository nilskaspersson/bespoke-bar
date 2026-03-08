"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

export function useOnNavigation(cb: undefined | (() => unknown)) {
	const pathname = usePathname();
	const initialPathnameRef = useRef(pathname);

	useLayoutEffect(() => {
		if (pathname === initialPathnameRef.current) {
			return;
		}

		cb?.();
		initialPathnameRef.current = pathname;
	}, [cb, pathname]);
}
