"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Reports whether `ref`'s element is within `rootMargin` of the viewport (via
 * IntersectionObserver). Starts `false` so SSR and the first client render
 * agree, then updates after mount. Used to render off-screen content lazily.
 */
export function useInView(
	ref: RefObject<Element | null>,
	{
		rootMargin = "0px",
		initialInView = false,
	}: { rootMargin?: string; initialInView?: boolean } = {},
): boolean {
	const [inView, setInView] = useState(initialInView);

	useEffect(() => {
		const el = ref.current;

		if (!el) {
			return;
		}

		if (typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ rootMargin },
		);

		observer.observe(el);

		return () => observer.disconnect();
	}, [ref, rootMargin]);

	return inView;
}
