import "./theme";

import { clsx } from "clsx";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
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
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
