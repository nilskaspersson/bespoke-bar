"use client";

import { useEffect } from "react";
import { onNavigation } from "../utils/navigation";

export function useOnNavigation(cb: undefined | (() => unknown)) {
	useEffect(() => {
		if (typeof cb !== "function") {
			return;
		}

		return onNavigation(cb);
	}, [cb]);
}
