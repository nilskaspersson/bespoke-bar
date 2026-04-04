"use client";

import { clsx } from "clsx";
import { m, type Transition } from "motion/react";
import type { ComponentProps, ReactNode, Ref } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
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
	withMotion?: boolean;
	children?: ReactNode;
} & Omit<ComponentProps<typeof m.div>, "layoutId" | "transition">;

export function MotionRecipeCard({
	recipe,
	className,
	children,
	withMotion,
	ref,
	...props
}: MotionRecipeCardProps) {
	if (!withMotion) {
		return (
			<div ref={ref} className={clsx(styles.card, className)}>
				{children}
			</div>
		);
	}

	return (
		<m.div
			ref={ref}
			className={clsx(styles.card, className)}
			layoutId={`recipe-card-${recipe.id}`}
			transition={transition}
			{...props}
		>
			{children}
		</m.div>
	);
}
