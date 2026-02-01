import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { OrganisationSwitcherLoader } from "@/features/organisation/components/OrganisationSwitcher/loader";
import { UserOrSignupLoader } from "@/features/organisation/user/components/UserOrSignup/loader";
import { Logo } from "@/ui/Logo";
import styles from "./styles.module.css";

export async function AppSidebar({
	children,
	className,
	toggle,
	...props
}: ComponentProps<"aside"> & {
	toggle?: ReactNode;
}) {
	"use cache";

	return (
		<aside className={clsx(className, styles.sidebar)} {...props} tabIndex={-1}>
			{toggle}

			<div className={clsx(styles.block, styles.header)}>
				<Logo />
			</div>

			<div className={styles.block}>
				<OrganisationSwitcherLoader className={styles.switcher} />
			</div>

			<div className={clsx(styles.block, styles.overscroll)}>{children}</div>

			<div className={clsx(styles.block, styles.footer)}>
				<UserOrSignupLoader />
			</div>
		</aside>
	);
}
