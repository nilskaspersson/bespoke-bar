import { Figtree } from "next/font/google";
import "./theme";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { AppHeader } from "@/app/components/AppHeader";
import { AuthProvider } from "@/app/components/AuthProvider";

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
			<body className={sans.variable}>
				<ThemeProvider>
					<AuthProvider>
						<AppHeader />
						<main>{children}</main>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
