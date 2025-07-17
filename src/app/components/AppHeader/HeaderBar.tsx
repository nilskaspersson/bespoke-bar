"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function HeaderBar({
	className,
	children,
	...props
}: ComponentProps<"header">) {
	const pathname = usePathname();

	return (
		<header
			className={clsx(className, styles.header, {
				[styles.overlay]: pathname === "/" || pathname === "/bar/create",
			})}
			{...props}
		>
			{children}
		</header>
	);
}
