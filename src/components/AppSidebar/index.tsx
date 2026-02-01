import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { OrganisationSwitcherLoader } from "@/features/organisation/components/OrganisationSwitcher/loader";
import { UserOrSignupLoader } from "@/features/organisation/user/components/UserOrSignup/loader";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Logo } from "@/ui/Logo";
import styles from "./styles.module.css";

export async function AppSidebar({
	children,
	className,
	toggleButtonProps,
	...props
}: ComponentProps<"aside"> & {
	toggleButtonProps?: ComponentProps<typeof Button>;
}) {
	"use cache";

	return (
		<aside className={clsx(className, styles.sidebar)} {...props} tabIndex={-1}>
			<Button variant="base" size="tiny" {...toggleButtonProps}>
				<Icon name="bars" size={2} />
			</Button>

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
