import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { clsx } from "clsx";
import { type ComponentProps, type ReactNode, Suspense } from "react";
import { OrganisationSwitcher } from "@/app/components/OrganisationSwitcher";
import { Button } from "@/ui/Button";
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
				<Suspense>
					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="ghost" size="tiny">
								Sign in
							</Button>
						</SignInButton>

						<SignUpButton mode="modal">
							<Button variant="solid" size="tiny" color="heavy">
								Sign up
							</Button>
						</SignUpButton>
					</SignedOut>
				</Suspense>

				<Suspense>
					<SignedIn>
						<UserButton showName />
					</SignedIn>
				</Suspense>
			</div>
		</aside>
	);
}
