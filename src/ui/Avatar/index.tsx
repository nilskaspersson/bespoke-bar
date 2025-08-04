import type { PublicUserData } from "@clerk/types";
import { clsx } from "clsx";
import Image from "next/image";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

const params = new URLSearchParams();

params.set("height", "56");
params.set("width", "56");
params.set("quality", "100");

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

	const src = `${user.imageUrl}?${params.toString()}`;

	return (
		<Image
			className={clsx(styles.avatar, className)}
			src={src}
			alt={`${user.firstName} ${user.lastName}`}
			width={28}
			height={28}
			{...props}
		/>
	);
}
