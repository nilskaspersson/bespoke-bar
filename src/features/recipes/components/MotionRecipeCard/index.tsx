"use client";

import { clsx } from "clsx";
import { m, type Transition } from "motion/react";
import type { ComponentProps, Ref } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Icon } from "@/ui/Icon";
import { SPRING_DAMPING, SPRING_STIFFNESS } from "@/utils/animate";
import styles from "./styles.module.css";

const transition: Transition = {
	type: "spring",
	stiffness: SPRING_STIFFNESS,
	damping: SPRING_DAMPING,
};

type MotionRecipeCardProps = {
	recipe: RecipeWithSpecs;
	className?: string;
	ref?: Ref<HTMLDivElement>;
} & Omit<ComponentProps<typeof m.div>, "children" | "layoutId" | "transition">;

export function MotionRecipeCard({
	recipe,
	className,
	ref,
	...props
}: MotionRecipeCardProps) {
	return (
		<m.div
			ref={ref}
			className={clsx(styles.card, className)}
			layoutId={`recipe-card-${recipe.id}`}
			transition={transition}
			{...props}
		>
			<RecipeCard
				recipe={recipe}
				withLink={false}
				nameAdornment={<Icon name="duotone-martini-glass" size={3} />}
			/>
		</m.div>
	);
}

MotionRecipeCard.Placeholder = function MotionRecipeCardPlaceholder({
	recipe,
	className,
}: {
	recipe: RecipeWithSpecs;
	className?: string;
}) {
	return (
		<div className={clsx(styles.card, className)}>
			<RecipeCard
				recipe={recipe}
				withLink={false}
				nameAdornment={<Icon name="duotone-martini-glass" size={3} />}
			/>
		</div>
	);
};
