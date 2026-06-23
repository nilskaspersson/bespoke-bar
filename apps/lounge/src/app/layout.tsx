import "@bespoke/ui/theme";
import { AppShell } from "@bespoke/ui/AppShell";
import shell from "@bespoke/ui/AppShell/styles.module.css";
import { LinkButton } from "@bespoke/ui/Button";
import { Footer } from "@bespoke/ui/Footer";
import { Header } from "@bespoke/ui/Header";
import { clsx } from "clsx";
import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import type { PropsWithChildren } from "react";

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
		<AppShell className={clsx(sans.variable, serif.variable)}>
			<div className={shell.layout}>
				<Header className={shell.header}>
					<LinkButton
						href={`${BAR_URL}/recipes`}
						variant="solid"
						size="tiny"
						color="heavy"
					>
						To the bar
					</LinkButton>
				</Header>

				<main className={shell.main}>{children}</main>

				<Footer
					className={shell.footer}
					barUrl={BAR_URL}
					loungeUrl={LOUNGE_URL}
				/>
			</div>
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
	robots: {
		index: true,
	},
};

export const viewport: Viewport = {
	viewportFit: "cover",
};
