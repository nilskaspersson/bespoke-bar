import "@bespoke/ui/theme";
import { AppShell } from "@bespoke/ui/AppShell";
import shell from "@bespoke/ui/AppShell/styles.module.css";
import { ThemeProvider } from "@bespoke/ui/theme/ThemeProvider";
import { NavigationObserver } from "@bespoke/ui/utils/navigation";
import { clsx } from "clsx";
import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { type PropsWithChildren, Suspense } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/Toaster";

const sans = Figtree({
	subsets: ["latin"],
	variable: "--font-sans-serif",
	display: "swap",
});

const serif = Newsreader({
	subsets: ["latin"],
	variable: "--font-serif",
	display: "swap",
});

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<AppShell className={clsx(sans.variable, serif.variable)}>
			<ThemeProvider>
				{/** biome-ignore lint/correctness/useUniqueElementIds: Needed to blur the app for open dialogs. */}
				<div className={shell.layout} id="root">
					<AuthProvider>{children}</AuthProvider>
				</div>

				<Toaster />
			</ThemeProvider>

			<Suspense>
				<NavigationObserver />
			</Suspense>
		</AppShell>
	);
}

export const metadata: Metadata = {
	/**
	 * The { title: "Name" } set by a page or layout will be interpolated into template
	 */
	title: {
		template: "%s :: Bespoke Bar",
		default: "Mise en place :: Bespoke Bar",
	},
	/**
	 * It's me!
	 */
	authors: {
		name: "Nils Kaspersson Viert",
		url: "https://github.com/nilskaspersson",
	},
	creator: "Nils Kaspersson Viert",
	publisher: "Nils Kaspersson Viert",
	/**
	 * Opt out of indexing of all pages by default. Pages down the line can opt in.
	 */
	robots: {
		index: false,
		follow: false,
	},
};

export const viewport: Viewport = {
	viewportFit: "cover",
};
