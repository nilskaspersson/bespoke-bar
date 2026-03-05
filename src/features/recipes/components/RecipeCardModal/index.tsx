"use client";

import { m } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useParticleEffect } from "@/hooks/useParticleEffect";
import { Checkbox } from "@/ui/Checkbox";
import { Container } from "@/ui/Container";
import { Dialog } from "@/ui/Dialog";
import styles from "./styles.module.css";

export function RecipeCardModal() {
	const { recipe, isFavorite, mounted, clear, dialogRef } = useRecipeCardModal(
		useShallow((s) => ({
			recipe: s.recipe,
			isFavorite: s.isFavorite,
			mounted: s.mounted,
			clear: s.clear,
			dialogRef: s.dialogRef,
		})),
	);

	const cardRef = useRef<HTMLDivElement>(null);
	const [particlesEnabled, setParticlesEnabled] = useLocalStorage(
		"particles-enabled",
		true,
	);
	const particleEffectActive = Boolean(recipe) && mounted && particlesEnabled;
	const canvasRef = useParticleEffect(cardRef, particleEffectActive);

	useLayoutEffect(() => {
		if (recipe) return;
		dialogRef.current?.close();
	}, [recipe, dialogRef]);

	return (
		<Dialog ref={dialogRef} handleClose={clear}>
			<m.div layoutRoot>
				{recipe && mounted ? (
					<>
						<canvas ref={canvasRef} className={styles.particles} />

						<Container className={styles.container}>
							<MotionRecipeCard
								withMotion
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

						<Checkbox
							label="Particle effects"
							size="small"
							checked={particlesEnabled}
							onChange={(e) => setParticlesEnabled(e.target.checked)}
							className={styles.particleToggle}
						/>
					</>
				) : null}
			</m.div>
		</Dialog>
	);
}
