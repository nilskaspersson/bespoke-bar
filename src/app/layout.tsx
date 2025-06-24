import "./theme";
import { clsx } from "clsx";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { AppFooter } from "@/app/components/AppFooter";
import { AppHeader } from "@/app/components/AppHeader";
import { AuthProvider } from "@/app/components/AuthProvider";
import styles from "./layout.module.css";

const sans = Figtree({
	subsets: ["latin"],
	variable: "--font-sans-serif",
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
			<body className={clsx(sans.variable, styles.body)}>
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
