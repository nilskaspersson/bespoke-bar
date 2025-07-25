"use client";

import { clsx } from "clsx";
import { useIsMounted } from "@/hooks/useIsMounted";
import { Button, type ButtonProps } from "@/ui/Button";
import { CopyToClipboard } from "@/ui/CopyToClipboard";
import { Icon } from "@/ui/Icon";
import { isShareSupported, shareText } from "@/utils/share";
import styles from "./styles.module.css";

export function ShareAction({
	value,
	children,
	...props
}: Omit<ButtonProps, "onClick"> & {
	value: string;
}) {
	const isMounted = useIsMounted();

	if (!isMounted) {
		return (
			<Button
				{...props}
				inert
				aria-disabled="true"
				className={clsx(props.className, styles.unmounted)}
			>
				<Icon name="share" size={1} />
				{children}
			</Button>
		);
	}

	if (!isShareSupported) {
		return (
			<CopyToClipboard
				{...props}
				getValue={() => value}
				iconSize={1}
				iconName="share"
			>
				{children}
			</CopyToClipboard>
		);
	}

	return (
		<Button {...props} onClick={() => shareText(value)}>
			<Icon name="share" size={1} />
			{children}
		</Button>
	);
}
