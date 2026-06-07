import "./_theme";
import { clsx } from "clsx";
import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { type PropsWithChildren, Suspense } from "react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/components/AuthProvider";
import { ScrollFix } from "@/components/ScrollFix";
import { AuthButtonsSkeleton } from "@/features/organisation/user/components/AuthButtons";
import { AuthButtonsLoader } from "@/features/organisation/user/components/AuthButtons/loader";
import { ThemeProvider } from "@/hooks/useTheme";
import { Toaster } from "@/ui/Toast/Toaster";
import { NavigationObserver } from "@/utils/navigation";
import { ThemeScript } from "./_theme/ThemeScript";
import styles from "./layout.module.css";

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
		<html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
			<body className={clsx(sans.variable, serif.variable, styles.body)}>
				<ThemeScript />

				<ThemeProvider>
					{/** biome-ignore lint/correctness/useUniqueElementIds: Needed to blur the app for open dialogs. */}
					<div className={styles.layout} id="root">
						<AuthProvider>
							<AppHeader className={styles.header}>
								<Suspense fallback={<AuthButtonsSkeleton />}>
									<AuthButtonsLoader />
								</Suspense>
							</AppHeader>

							<Suspense fallback={<main className={styles.main} />}>
								<main className={styles.main}>{children}</main>
							</Suspense>
						</AuthProvider>

						<Suspense>
							<AppFooter className={styles.footer} />
						</Suspense>
					</div>

					<Toaster />
				</ThemeProvider>

				<Suspense>
					<ScrollFix />
					<NavigationObserver />
				</Suspense>
			</body>
		</html>
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
		name: "Nils Kaspersson",
		url: "https://github.com/nilskaspersson",
	},
	creator: "Nils Kaspersson",
	publisher: "Nils Kaspersson",
	/**
	 * Opt out of indexing of all pages by default. Pages down the line can opt in.
	 */
	robots: {
		index: false,
	},
};

export const viewport: Viewport = {
	viewportFit: "cover",
};
