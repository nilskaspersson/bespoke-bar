"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { Button } from "@bespoke/ui/Button";
import { usePopover } from "@bespoke/ui/hooks/usePopover";
import { Icon } from "@bespoke/ui/Icon";
import { Popover } from "@bespoke/ui/Popover";
import { stopPropagation } from "@bespoke/ui/utils/events";
import clsx from "clsx";
import type { ComponentProps } from "react";
import { IngredientCard } from "@/features/ingredients/components/IngredientCard";
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
				onClick={stopPropagation}
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
