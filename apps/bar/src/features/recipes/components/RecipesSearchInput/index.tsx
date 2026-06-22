"use client";

import { Icon } from "@bespoke/ui/Icon";
import { Input } from "@bespoke/ui/Input";
import { Kbd } from "@bespoke/ui/Kbd";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useRef } from "react";
import styles from "./styles.module.css";

export function RecipesSearchInput({
	className,
	...props
}: ComponentPropsWithoutRef<typeof Input>) {
	const ref = useRef<HTMLInputElement>(null);

	return (
		<Input
			type="text"
			placeholder="Find your Recipes…"
			autoComplete="off"
			startAdornment={<Icon name="magnifying-glass" size={4} />}
			endAdornment={
				<Kbd shortcut="mod+f" onTrigger={() => ref.current?.focus()} />
			}
			rounded
			large
			fullWidth
			className={clsx(className, styles.input)}
			{...props}
			ref={ref}
		/>
	);
}
