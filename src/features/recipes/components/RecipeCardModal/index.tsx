"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { useParticleEffect } from "@/hooks/useParticleEffect";
import { Container } from "@/ui/Container";
import styles from "./styles.module.css";

export function RecipeCardModal() {
	const { recipe, isFavorite, clear } = useRecipeCardModal(
		useShallow((s) => ({
			recipe: s.recipe,
			isFavorite: s.isFavorite,
			clear: s.clear,
		})),
	);

	const cardRef = useRef<HTMLDivElement>(null);
	const canvasRef = useParticleEffect(cardRef, !!recipe);

	const handleEscape = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				clear();
			}
		},
		[clear],
	);

	useEffect(() => {
		if (!recipe) return;

		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [recipe, handleEscape]);

	if (!recipe) return null;

	return (
		<motion.div className={styles.overlay} layoutRoot onClick={clear}>
			<div className={styles.backdrop} />
			<canvas ref={canvasRef} className={styles.particles} />

			<Container
				onClick={(e) => e.stopPropagation()}
				className={styles.container}
			>
				<MotionRecipeCard
					ref={cardRef}
					recipe={recipe}
					className={styles.card}
				/>

				<RecipeActions
					recipe={recipe}
					withLink
					isFavorite={isFavorite}
					className={styles.actions}
				/>
			</Container>
		</motion.div>
	);
}
