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
	onClick,
	...props
}: ButtonProps & {
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
				endAdornment={<Icon name="share" size={1} />}
			>
				{children}
			</Button>
		);
	}

	const url = new URL(value, window.location.origin).toString();

	if (!isShareSupported) {
		return (
			<CopyToClipboard
				{...props}
				onClick={onClick}
				getValue={() => url}
				iconSize={1}
				iconName="share"
			>
				{children}
			</CopyToClipboard>
		);
	}

	return (
		<Button
			{...props}
			onClick={(event) => {
				shareText(url);
				onClick?.(event);
			}}
			endAdornment={<Icon name="share" size={1} />}
		>
			{children}
		</Button>
	);
}
