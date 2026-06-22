"use client";

import { Button } from "@bespoke/ui/Button";
import { Chip } from "@bespoke/ui/Chip";
import { Flex } from "@bespoke/ui/Flex";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import styles from "./styles.module.css";

export function AuthButtons() {
	return (
		<Suspense fallback={<AuthButtonsSkeleton />}>
			<Show when="signed-out">
				<SignInButton mode="modal">
					<Button variant="ghost" size="tiny" color="accent">
						Sign in
					</Button>
				</SignInButton>

				<SignUpButton mode="modal">
					<Button
						variant="solid"
						size="tiny"
						color="heavy"
						className={styles.button}
					>
						Get Bespoke Bar
						<Chip color="amber" size={0} weight={600} className={styles.chip}>
							Free!
						</Chip>
					</Button>
				</SignUpButton>
			</Show>

			<Show when="signed-in">
				<UserButton />
			</Show>
		</Suspense>
	);
}

export function AuthButtonsSkeleton() {
	return (
		<Flex gap={2}>
			<Skeleton width="28px" height="28px" variant="circular" />
		</Flex>
	);
}
