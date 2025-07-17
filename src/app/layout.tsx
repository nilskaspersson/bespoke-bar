import "./theme";
import { clsx } from "clsx";
import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { AppFooter } from "@/app/components/AppFooter";
import { AppHeader } from "@/app/components/AppHeader";
import { AuthProvider } from "@/app/components/AuthProvider";
import { ScrollFix } from "@/app/components/ScrollFix";
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
		<html
			lang="en"
			/**
			 * Suppresses hydration warning of next-themes
			 */
			suppressHydrationWarning
		>
			<body className={clsx(sans.variable, serif.variable, styles.body)}>
				<ScrollFix />

				<ThemeProvider>
					<AuthProvider>
						<AppHeader className={styles.header} />
						<main className={styles.main}>{children}</main>
						<AppFooter className={styles.footer} />
					</AuthProvider>
				</ThemeProvider>
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
