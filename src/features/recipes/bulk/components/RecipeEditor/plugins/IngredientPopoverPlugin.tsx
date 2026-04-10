"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useId, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { IngredientCard } from "@/features/ingredients/components/IngredientCard";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import styles from "../RecipeEditor.module.css";

export function IngredientPopoverPlugin({
	ingredients,
}: {
	ingredients: Ingredient[];
}) {
	const [editor] = useLexicalComposerContext();
	const popoverId = useId();
	const [activeIngredient, setActiveIngredient] = useState<Ingredient | null>(
		null,
	);
	const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

	const handleClick = useCallback(
		(event: MouseEvent) => {
			const target = event.target;

			if (!(target instanceof HTMLElement)) {
				return;
			}

			const ingredientId = target.dataset.ingredientId;

			if (!ingredientId) {
				return;
			}

			const ingredient = ingredients.find((i) => i.id === ingredientId);

			if (!ingredient) {
				return;
			}

			/**
			 * Set anchor-name on the clicked token so the Popover can position itself
			 */
			if (anchorElement) {
				anchorElement.style.anchorName = "";
			}

			target.style.anchorName = `--${popoverId}`;
			setAnchorElement(target);
			setActiveIngredient(ingredient);
		},
		[ingredients, anchorElement, popoverId],
	);

	useEffect(() => {
		return editor.registerRootListener((rootElement, prevRootElement) => {
			if (prevRootElement) {
				prevRootElement.removeEventListener("click", handleClick);
			}
			if (rootElement) {
				rootElement.addEventListener("click", handleClick);
			}
		});
	}, [editor, handleClick]);

	function handleClose() {
		if (anchorElement) {
			anchorElement.style.anchorName = "";
		}
		setActiveIngredient(null);
		setAnchorElement(null);
	}

	return (
		<Popover
			id={popoverId}
			anchorId={popoverId}
			popover="auto"
			position="top"
			isOpen={activeIngredient !== null}
			onToggle={(e) => {
				if (e.newState === "closed") {
					handleClose();
				}
			}}
			className={styles.ingredientPopover}
		>
			{activeIngredient ? (
				<>
					<IngredientCard ingredient={activeIngredient} withActions />
					<Button
						variant="ghost"
						icon
						size="tiny"
						className={styles.popoverClose}
						popoverTarget={popoverId}
						popoverTargetAction="hide"
					>
						<Icon name="xmark" size={2} />
					</Button>
				</>
			) : null}
		</Popover>
	);
}
