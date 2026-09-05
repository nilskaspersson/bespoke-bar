import type { ComponentProps } from "react";

export function Abv(props: Omit<ComponentProps<"abbr">, "children">) {
	return (
		<abbr title="Alcohol by Volume" {...props}>
			ABV
		</abbr>
	);
}
