"use client";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Button, type ButtonProps } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { toast } from "@/ui/Toast";
import type { Scale } from "@/utils/types";

export function CopyToClipboard({
	children,
	getValue,
	iconSize,
	...props
}: { getValue: () => string | null; iconSize?: Scale } & Omit<
	ButtonProps,
	"onClick"
>) {
	const [copy, status] = useCopyToClipboard();

	return (
		<Button
			variant="base"
			onClick={async () => {
				const value = getValue();

				if (value) {
					await copy(value);
					toast.success("Copied to clipboard");
				}
			}}
			title={status === "pending" ? "Copy to clipboard" : undefined}
			{...props}
		>
			<Icon name={status === "success" ? "check" : "copy"} size={iconSize} />

			{children}
		</Button>
	);
}
