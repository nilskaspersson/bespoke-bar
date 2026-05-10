import { clsx } from "clsx";
import { cacheLife } from "next/cache";
import type { ComponentProps } from "react";
import { AuthButtonsLoader } from "@/features/organisation/user/components/AuthButtons/loader";
import { Logo } from "@/ui/Logo";
import styles from "./styles.module.css";

export async function AppHeader({
	className,
	children,
	...props
}: ComponentProps<"header">) {
	"use cache";
	cacheLife("max");

	return (
		<header className={clsx(styles.header, className)} {...props}>
			<div className={styles.container}>
				<Logo />

				<div>{children}</div>

				<div className={styles.auth}>
					<AuthButtonsLoader />
				</div>
			</div>
		</header>
	);
}
