"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { type ComponentProps, type PropsWithChildren, useMemo } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useTheme } from "@/hooks/useTheme";

const LOUNGE_URL = process.env.NEXT_PUBLIC_LOUNGE_URL ?? "";

const localization: ComponentProps<typeof ClerkProvider>["localization"] = {
	organizationProfile: {
		profilePage: {
			dangerSection: {
				deleteOrganization: {
					messageLine2:
						"All Recipes will be permanently deleted. This action is permanent and irreversible.",
				},
			},
		},
	},
};

export function AuthProvider({ children }: PropsWithChildren) {
	const { resolvedTheme } = useTheme();
	const isMounted = useIsMounted();

	const appearance: ComponentProps<typeof ClerkProvider>["appearance"] =
		useMemo(
			() => ({
				theme: isMounted && resolvedTheme === "dark" ? dark : undefined,
				options: {
					termsPageUrl: `${LOUNGE_URL}/terms`,
					privacyPageUrl: `${LOUNGE_URL}/privacy`,
				},
			}),
			[isMounted, resolvedTheme],
		);

	return (
		<ClerkProvider
			appearance={appearance}
			localization={localization}
			signInFallbackRedirectUrl="/recipes"
			signUpFallbackRedirectUrl="/recipes"
		>
			{children}
		</ClerkProvider>
	);
}
