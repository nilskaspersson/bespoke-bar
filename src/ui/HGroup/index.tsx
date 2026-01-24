import type { ComponentProps, ReactNode } from "react";
import { Text } from "@/ui/Text";

export function HGroup({
	children,
	overline,
	tagline,
	...props
}: ComponentProps<"hgroup"> & {
	overline?: ReactNode;
	tagline?: ReactNode;
}) {
	return (
		<hgroup {...props}>
			{overline ? (
				<Text as="p" size={1} light>
					{overline}
				</Text>
			) : null}

			{children}

			{tagline ? (
				<Text as="p" size={1} light>
					{tagline}
				</Text>
			) : null}
		</hgroup>
	);
}
