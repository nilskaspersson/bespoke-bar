import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "../Icon";
import styles from "./styles.module.css";

export function ImageUploadPreview({
	alt,
	src,
	placeholder,
	className,
	...props
}: Omit<ComponentProps<"div">, "src" | "alt"> & {
	alt: string;
	src: string | null;
	placeholder?: ReactNode;
}) {
	return (
		<div {...props} className={clsx(styles.container, className)}>
			{src ? (
				<img src={src} className={styles.image} alt={alt} />
			) : (
				(placeholder ?? <Icon size={8} name="image" className={styles.icon} />)
			)}
		</div>
	);
}
