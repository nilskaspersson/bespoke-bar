import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Figtree } from "next/font/google";
import "./(theme)";
import type { PropsWithChildren } from "react";
import { AppHeader } from "@/app/AppHeader";

const sans = Figtree({
	subsets: ["latin"],
	variable: "--font-sans-serif",
	display: "swap",
});

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="en">
			<body className={sans.variable}>
				<ClerkProvider
					appearance={{
						baseTheme: dark,
					}}
				>
					<AppHeader />

					<main>{children}</main>
				</ClerkProvider>
			</body>
		</html>
	);
}
