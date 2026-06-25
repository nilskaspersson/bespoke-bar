"use client";

// Offline Dev Auth client stub. See docs/offline.md.

import type { PropsWithChildren, ReactNode } from "react";
import styles from "./styles.module.css";

export function ClerkProvider({ children }: { children?: ReactNode }) {
	return children;
}

export function Show({
	when,
	children,
}: {
	when?: string;
	children: ReactNode;
}) {
	return when === "signed-in" ? children : null;
}

export function SignInButton({ children }: PropsWithChildren) {
	return children;
}

export function SignUpButton({ children }: PropsWithChildren) {
	return children;
}

export function UserButton() {
	return (
		<span
			role="img"
			aria-label="Offline user"
			title="Offline mode"
			className={styles.avatar}
		>
			T
		</span>
	);
}

export function useClerk() {
	return {
		openOrganizationProfile: () => {},
		openUserProfile: () => {},
		signOut: async () => {},
	};
}

export function CreateOrganization() {
	return null;
}
