"use client";

import type { IconName } from "@/libs/icons/types";
import { Button, type ButtonProps } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { toast } from "@/ui/Toast";
import type { Scale } from "@/utils/types";

export function CopyToClipboard({
	children,
	getValue,
	iconSize,
	iconName = "copy",
	...props
}: {
	getValue: () => string | null;
	iconSize?: Scale;
	iconName?: IconName;
} & Omit<ButtonProps, "onClick">) {
	return (
		<Button
			variant="base"
			onClick={async () => {
				const value = getValue();

				if (value) {
					await navigator.clipboard.writeText(value);
					toast.success("Copied to clipboard");
				}
			}}
			{...props}
		>
			<Icon name={iconName} size={iconSize} />

			{children}
		</Button>
	);
}
