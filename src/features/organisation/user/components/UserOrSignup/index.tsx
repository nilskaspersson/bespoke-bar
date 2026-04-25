"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Skeleton } from "@/ui/Skeleton";

const userButtonAppearance = {
	elements: {
		userButtonBox: {
			flexDirection: "row-reverse" as const,
			gap: 0,
		},
		userButtonOuterIdentifier: {
			whiteSpace: "nowrap" as const,
			textOverflow: "ellipsis" as const,
			overflow: "hidden" as const,
		},
	},
};

export function UserOrSignup() {
	return (
		<Suspense fallback={<UserOrSignupSkeleton />}>
			<Show when="signed-out">
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
			</Show>

			<Show when="signed-in">
				<UserButton showName appearance={userButtonAppearance} />
			</Show>
		</Suspense>
	);
}

export function UserOrSignupSkeleton() {
	return (
		<Flex gap={2} alignItems="center">
			<Skeleton variant="circular" width="28px" height="28px" />
			<Skeleton width="14ch" height="16px" />
		</Flex>
	);
}
