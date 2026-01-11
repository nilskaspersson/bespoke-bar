"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { type ComponentProps, type PropsWithChildren, useMemo } from "react";

export function AuthProvider({ children }: PropsWithChildren) {
	const { resolvedTheme } = useTheme();

	const appearance: ComponentProps<typeof ClerkProvider>["appearance"] =
		useMemo(
			() => ({
				baseTheme: resolvedTheme === "dark" ? dark : undefined,
				layout: {
					termsPageUrl: "/terms",
					privacyPageUrl: "/privacy",
				},
			}),
			[resolvedTheme],
		);

	return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}
