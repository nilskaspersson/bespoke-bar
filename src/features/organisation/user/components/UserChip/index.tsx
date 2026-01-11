import type { PublicUserData } from "@clerk/types";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { getFullName } from "@/features/organisation/utils";
import { Avatar } from "@/ui/Avatar";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function UserChip({
	user,
	className,
	...props
}: {
	user: PublicUserData | null | undefined;
} & Omit<ComponentProps<"span">, "children">) {
	if (!user) {
		return "Unknown user";
	}

	return (
		<span className={clsx(styles.chip, className)} {...props}>
			<Avatar user={user} className={styles.avatar} />

			<Text
				truncate
				compact
				size={2}
				title={`${user.firstName} ${user.lastName}`}
				className={styles.text}
				weight={500}
			>
				{getFullName(user, { abbreviate: true })}
			</Text>
		</span>
	);
}
