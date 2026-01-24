"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { Suspense } from "react";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Skeleton } from "@/ui/Skeleton";

export function UserOrSignup() {
	return (
		<Suspense fallback={<UserOrSignupSkeleton />}>
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

			<SignedIn>
				<UserButton showName />
			</SignedIn>
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
