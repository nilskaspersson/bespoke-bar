"use client";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Button, type ButtonProps } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import type { Scale } from "@/utils/types";

export function CopyToClipboard({
	getValue,
	size,
	...props
}: { getValue: () => string | null; size?: Scale } & Omit<
	ButtonProps,
	"size"
>) {
	const [copy, status] = useCopyToClipboard();

	return (
		<Button
			variant="base"
			icon
			onClick={async () => {
				const value = getValue();

				if (value) {
					await copy(value);
				}
			}}
			title={status === "pending" ? "Copy to clipboard" : undefined}
			{...props}
		>
			<Icon name={status === "success" ? "check" : "copy"} size={size} />
		</Button>
	);
}
