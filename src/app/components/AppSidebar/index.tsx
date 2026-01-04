import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { OrganisationSwitcher } from "@/features/organisation/components/OrganisationSwitcher";
import { UserOrSignup } from "@/features/organisation/components/UserOrSignup";
import { Logo } from "@/ui/Logo";
import styles from "./styles.module.css";

export function AppSidebar({
	children,
	className,
	toggle,
	...props
}: ComponentProps<"aside"> & {
	toggle?: ReactNode;
}) {
	return (
		<aside className={clsx(className, styles.sidebar)} {...props} tabIndex={-1}>
			{toggle}

			<div className={clsx(styles.block, styles.header)}>
				<Logo />
			</div>

			<div className={styles.block}>
				<OrganisationSwitcher className={styles.switcher} />
			</div>

			<div className={clsx(styles.block, styles.overscroll)}>{children}</div>

			<div className={clsx(styles.block, styles.footer)}>
				<UserOrSignup />
			</div>
		</aside>
	);
}
