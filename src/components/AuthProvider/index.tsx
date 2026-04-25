"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { type ComponentProps, type PropsWithChildren, useMemo } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useTheme } from "@/hooks/useTheme";

export function AuthProvider({ children }: PropsWithChildren) {
	const { resolvedTheme } = useTheme();
	const isMounted = useIsMounted();

	const appearance: ComponentProps<typeof ClerkProvider>["appearance"] =
		useMemo(
			() => ({
				theme: isMounted && resolvedTheme === "dark" ? dark : undefined,
				options: {
					termsPageUrl: "/terms",
					privacyPageUrl: "/privacy",
				},
			}),
			[isMounted, resolvedTheme],
		);

	return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}
