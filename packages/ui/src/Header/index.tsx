import { clsx } from "clsx";
import { cacheLife } from "next/cache";
import type { ComponentProps } from "react";
import { Flex } from "../Flex";
import { Logo } from "../Logo";
import styles from "./styles.module.css";

export async function Header({
	className,
	children,
	...props
}: ComponentProps<"header">) {
	"use cache";
	cacheLife("max");

	return (
		<header className={clsx(styles.header, className)} {...props}>
			<Flex justifyContent="space-between" gap={4} className={styles.container}>
				<Logo />
				<nav className={styles.nav}>{children}</nav>
			</Flex>
		</header>
	);
}
