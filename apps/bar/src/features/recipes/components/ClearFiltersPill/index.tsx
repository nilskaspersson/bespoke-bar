"use client";

import { Button } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

type Props = {
	faded?: boolean;
};

export function ClearFiltersPill({
	faded,
	className,
	...props
}: Props & ComponentProps<typeof Button>) {
	return (
		<Button
			{...props}
			className={clsx(className, styles.pill)}
			variant="clear"
			color="amber"
			rounded
		>
			<Icon name="xmark" size={4} />

			<Text as="span" size={2} weight={600} compact>
				Clear filters
			</Text>
		</Button>
	);
}
