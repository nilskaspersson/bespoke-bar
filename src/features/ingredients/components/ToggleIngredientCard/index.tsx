"use client";

import clsx from "clsx";
import type { ComponentProps } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { IngredientCard } from "@/features/ingredients/components/IngredientCard";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import styles from "./styles.module.css";

export function ToggleIngredientCard({
	ingredient,
	className,
	...props
}: ComponentProps<typeof Button> & {
	ingredient: Partial<Ingredient>;
}) {
	const popover = usePopover();

	return (
		<>
			<Button
				variant="base"
				className={clsx(className, styles.button)}
				{...props}
				{...popover.triggerProps}
			>
				{ingredient.name}
			</Button>

			<Popover {...popover.contentProps} position="top">
				<IngredientCard ingredient={ingredient} withActions />

				<Button
					variant="ghost"
					icon
					size="tiny"
					className={styles.close}
					popoverTarget={popover.triggerProps.popoverTarget}
					popoverTargetAction="hide"
				>
					<Icon name="xmark" size={2} />
				</Button>
			</Popover>
		</>
	);
}
