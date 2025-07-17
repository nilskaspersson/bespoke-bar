import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Button } from "@/ui/Button";
import { Logo } from "@/ui/Logo";
import { HeaderBar } from "./HeaderBar";
import styles from "./styles.module.css";

export function AppHeader({
	className,
	...props
}: Omit<ComponentProps<"header">, "children">) {
	return (
		<HeaderBar className={clsx(styles.header, className)} {...props}>
			<div className={styles.container}>
				<Logo />

				<div className={styles.grid}>
					<SignedOut>
						<SignUpButton mode="modal">
							<Button variant="ghost" size="tiny">
								Sign up
							</Button>
						</SignUpButton>

						<SignInButton mode="modal">
							<Button variant="solid" size="tiny" color="heavy">
								Sign in
							</Button>
						</SignInButton>
					</SignedOut>

					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</div>
		</HeaderBar>
	);
}
