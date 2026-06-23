import "@bespoke/ui/theme";
import { LinkButton } from "@bespoke/ui/Button";
import { Footer } from "@bespoke/ui/Footer";
import { Header } from "@bespoke/ui/Header";
import { ThemeScript } from "@bespoke/ui/theme/ThemeScript";
import { clsx } from "clsx";
import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import type { PropsWithChildren } from "react";
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

const BAR_URL = process.env.NEXT_PUBLIC_BAR_URL ?? "";
const LOUNGE_URL = process.env.NEXT_PUBLIC_LOUNGE_URL ?? "";

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
			<body className={clsx(sans.variable, serif.variable, styles.body)}>
				<ThemeScript />

				<div className={styles.layout}>
					<Header className={styles.header}>
						<LinkButton
							href={`${BAR_URL}/recipes`}
							variant="solid"
							size="tiny"
							color="heavy"
						>
							To the bar
						</LinkButton>
					</Header>

					<main className={styles.main}>{children}</main>

					<Footer
						className={styles.footer}
						barUrl={BAR_URL}
						loungeUrl={LOUNGE_URL}
					/>
				</div>
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
