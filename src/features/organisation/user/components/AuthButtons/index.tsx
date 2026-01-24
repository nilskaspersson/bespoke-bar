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
import { Skeleton } from "@/ui/Skeleton";

export function AuthButtons() {
	return (
		<Suspense fallback={<AuthButtonsSkeleton />}>
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
				<UserButton />
			</SignedIn>
		</Suspense>
	);
}

export function AuthButtonsSkeleton() {
	return (
		<>
			<Skeleton width="56px" height="28px" />
			<Skeleton width="64px" height="28px" />
		</>
	);
}
