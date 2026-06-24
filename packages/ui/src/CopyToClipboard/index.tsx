"use client";

import { Button, type ButtonProps } from "../Button";
import { Icon } from "../Icon";
import type { IconName } from "../icons/types";
import { toast } from "../Toast";
import type { Scale } from "../utils/types";

export function CopyToClipboard({
	children,
	getValue,
	iconSize,
	iconName = "copy",
	onClick,
	...props
}: {
	getValue: () => string | null;
	iconSize?: Scale;
	iconName?: IconName;
} & ButtonProps) {
	return (
		<Button
			variant="base"
			onClick={async (event) => {
				const value = getValue();

				if (value) {
					await navigator.clipboard.writeText(value);
					toast.success("Copied to clipboard");
				}

				onClick?.(event);
			}}
			startAdornment={<Icon name={iconName} size={iconSize} />}
			{...props}
		>
			{children}
		</Button>
	);
}
