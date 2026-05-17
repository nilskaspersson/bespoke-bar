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
			{typeof overline === "string" ? (
				<Text as="p" size={1} light>
					{overline}
				</Text>
			) : (
				overline
			)}

			{children}

			{typeof tagline === "string" ? (
				<Text as="p" size={1} light>
					{tagline}
				</Text>
			) : (
				tagline
			)}
		</hgroup>
	);
}
