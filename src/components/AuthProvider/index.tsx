"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { type ComponentProps, type PropsWithChildren, useMemo } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";

export function AuthProvider({ children }: PropsWithChildren) {
	const { resolvedTheme } = useTheme();
	const isMounted = useIsMounted();

	const appearance: ComponentProps<typeof ClerkProvider>["appearance"] =
		useMemo(
			() => ({
				baseTheme: isMounted && resolvedTheme === "dark" ? dark : undefined,
				layout: {
					termsPageUrl: "/terms",
					privacyPageUrl: "/privacy",
				},
			}),
			[isMounted, resolvedTheme],
		);

	return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}
