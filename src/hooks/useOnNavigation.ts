"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

export function useOnNavigation(callback: undefined | (() => unknown)) {
	const pathname = usePathname();
	const initialPathnameRef = useRef(pathname);

	useLayoutEffect(() => {
		if (pathname === initialPathnameRef.current) {
			return;
		}

		callback?.();
		initialPathnameRef.current = pathname;
	}, [callback, pathname]);
}
