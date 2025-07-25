import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@/ui/Icon";
import type { IconName } from "@/ui/Icon/types";
import { Text } from "@/ui/Text";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale, SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	children: ReactNode;
	color?: SystemColor;
	heading?: ReactNode;
	icon?: IconName;
	size?: Scale;
	variant?: "solid" | "inset";
};

export function Callout({
	children,
	className,
	color = "accent",
	heading,
	icon,
	size = 3,
	style,
	variant = "solid",
	...props
}: Props & ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={clsx(
				styles.callout,
				className,
				styles[color],
				styles[variant],
			)}
			style={mergeStyleSources(
				style,
				toCSSVars({
					jsxSize: size ? `var(--size-${size})` : undefined,
				}),
			)}
		>
			{icon ? <Icon name={icon} size={size} className={styles.icon} /> : null}

			<div className={styles.content}>
				{heading ? (
					<Text as="div" size={size} compact heavy weight={600}>
						{heading}
					</Text>
				) : null}

				<Text as="div" size={size} compact>
					{children}
				</Text>
			</div>
		</div>
	);
}
