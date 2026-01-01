import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function ImageUploadPreview({
	alt,
	src,
	className,
}: Omit<ComponentProps<"img">, "src" | "alt"> & {
	alt: string;
	src: string | null;
}) {
	return (
		<div className={clsx(styles.container, className)}>
			{src ? (
				<img src={src} className={styles.image} alt={alt} />
			) : (
				<Icon size={8} name="image" className={styles.icon} />
			)}
		</div>
	);
}
