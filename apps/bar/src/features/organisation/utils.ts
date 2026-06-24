import type { PublicUserData } from "@clerk/nextjs/types";

export function getFullName<T extends PublicUserData>(
	user: T,
	options: {
		abbreviate?: boolean;
	} = {},
): string | undefined {
	if (!user.firstName && !user.lastName) {
		return undefined;
	}

	if (user.firstName) {
		/**
		 * Append the last name if it exists, and abbreviate it if configured.
		 */
		const lastName = user.lastName
			? options.abbreviate
				? user.lastName.slice(0, 1)
				: user.lastName
			: "";

		return user.firstName + (lastName ? ` ${lastName}` : "");
	}

	return user.lastName ?? undefined;
}
