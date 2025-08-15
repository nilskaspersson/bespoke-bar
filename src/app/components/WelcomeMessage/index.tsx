"use client";

import { useUser } from "@clerk/nextjs";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Heading } from "@/ui/Heading";
import styles from "./styles.module.css";

export function WelcomeMessage({
	className,
}: Omit<ComponentProps<"header">, "children">) {
	const { user } = useUser();

	return (
		<header className={clsx(styles.welcome, className)}>
			<Heading level="h1" size={8}>
				{user?.firstName ? `Welcome back, ${user.firstName}!` : "Welcome back!"}
			</Heading>
		</header>
	);
}
