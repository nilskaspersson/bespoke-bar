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

export function UserOrSignup() {
	return (
		<div>
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
	);
}
