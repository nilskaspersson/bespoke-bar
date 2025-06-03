import {
	OrganizationSwitcher,
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { ThemePicker } from "@/app/components/ThemePicker";
import { Button } from "@/ui/Button";
import styles from "./styles.module.css";

export function AppHeader() {
	return (
		<header className={styles.header}>
			<div className={styles.grid}>
				<div className={styles.logo}>
					<Link href="/">Bespoke Bar</Link>
				</div>

				<SignedIn>
					<OrganizationSwitcher hidePersonal hideSlug />
				</SignedIn>
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
		</header>
	);
}
