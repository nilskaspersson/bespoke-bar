import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { ThemeScript } from "../theme/ThemeScript";
import styles from "./styles.module.css";

export function AppShell({
	className,
	children,
	...props
}: ComponentProps<"body">) {
	return (
		<html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
			<body className={clsx(className, styles.body)} {...props}>
				<ThemeScript />
				{children}
			</body>
		</html>
	);
}
