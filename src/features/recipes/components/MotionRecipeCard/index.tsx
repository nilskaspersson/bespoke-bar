"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";
import type { ComponentProps, Ref } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

const transition = {
	type: "spring" as const,
	stiffness: 400,
	damping: 35,
};

const nameAdornment = <Icon name="duotone-martini-glass" size={3} />;

type MotionRecipeCardProps = {
	recipe: RecipeWithSpecs;
	className?: string;
	ref?: Ref<HTMLDivElement>;
} & Omit<
	ComponentProps<typeof motion.div>,
	"children" | "layoutId" | "transition"
>;

export function MotionRecipeCard({
	recipe,
	className,
	ref,
	...props
}: MotionRecipeCardProps) {
	return (
		<motion.div
			ref={ref}
			className={clsx(styles.card, className)}
			layoutId={`recipe-card-${recipe.id}`}
			transition={transition}
			{...props}
		>
			<RecipeCard
				recipe={recipe}
				withLink={false}
				nameAdornment={nameAdornment}
			/>
		</motion.div>
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
				nameAdornment={nameAdornment}
			/>
		</div>
	);
};
