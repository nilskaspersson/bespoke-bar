"use client";

import { useUser } from "@clerk/nextjs";
import { Heading } from "@/ui/Heading";
import styles from "./styles.module.css";

export function WelcomeMessage() {
	const { user } = useUser();

	return (
		<header className={styles.welcome}>
			<Heading level="h1" size={8}>
				{user?.firstName ? `Welcome back, ${user.firstName}!` : "Welcome back!"}
			</Heading>
		</header>
	);
}
