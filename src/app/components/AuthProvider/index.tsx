"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { type ComponentProps, type PropsWithChildren, useMemo } from "react";

export function AuthProvider({ children }: PropsWithChildren) {
	const { resolvedTheme } = useTheme();

	const appearance: ComponentProps<typeof ClerkProvider>["appearance"] =
		useMemo(
			() => (resolvedTheme === "dark" ? { baseTheme: dark } : undefined),
			[resolvedTheme],
		);

	return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}
