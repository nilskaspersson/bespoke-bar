import type { PublicUserData } from "@clerk/types";
import { clsx } from "clsx";
import Image from "next/image";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function Avatar({
	user,
	className,
	...props
}: {
	user: PublicUserData | null | undefined;
} & Omit<Partial<ComponentProps<typeof Image>>, "src">) {
	if (!user) {
		return null;
	}

	return (
		<Image
			className={clsx(styles.avatar, className)}
			src={user.imageUrl}
			alt={`${user.firstName} ${user.lastName}`}
			width={28}
			height={28}
			{...props}
		/>
	);
}
