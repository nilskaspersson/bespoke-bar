import { Figtree } from "next/font/google";
import "./(theme)";
import type { PropsWithChildren } from "react";

const sans = Figtree({
	subsets: ["latin"],
	variable: "--font-sans-serif",
	display: "swap",
});

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="en">
			<body className={sans.variable}>
				<main>{children}</main>
			</body>
		</html>
	);
}
