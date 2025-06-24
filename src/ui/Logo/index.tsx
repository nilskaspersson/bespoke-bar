import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function Logo({
	className,
	...props
}: Partial<ComponentProps<typeof Link>>) {
	return (
		<Link href="/" className={clsx(styles.logo, className)} {...props}>
			Bespoke Bar
		</Link>
	);
}
