import { Figtree } from "next/font/google";
import "./theme";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./layout.module.css";

const sans = Figtree({
	subsets: ["latin"],
	variable: "--font-sans-serif",
	display: "swap",
});

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="en">
			<body className={clsx(sans.variable, styles.body)}>
				<main className={styles.main}>{children}</main>
			</body>
		</html>
	);
}
