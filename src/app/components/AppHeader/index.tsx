import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { clsx } from "clsx";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { ThemePicker } from "@/app/components/ThemePicker";
import { Button } from "@/ui/Button";
import styles from "./styles.module.css";

export function AppHeader({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<header className={clsx(styles.header, className)} {...props}>
			<div className={styles.container}>
				<div className={styles.grid}>
					<div className={styles.logo}>
						<Link href="/">Bespoke Bar</Link>
					</div>
				</div>

				<div className={styles.grid}>
					<ThemePicker />

					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="base" className={styles.button}>
								Sign in
							</Button>
						</SignInButton>

						<SignUpButton mode="modal">
							<Button variant="base" className={styles.button}>
								Sign up
							</Button>
						</SignUpButton>
					</SignedOut>

					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</div>
		</header>
	);
}
