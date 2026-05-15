"use client";

import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useRef } from "react";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
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
