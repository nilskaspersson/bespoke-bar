"use client";

import { m } from "motion/react";
import { useDeferredValue, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { SelectServings } from "@/features/recipes/components/SelectServings";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import { RecipeMetrics } from "@/features/recipes/metrics/components/RecipeMetrics";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import type { UnitSystems } from "@/features/units/utils/convert";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useParticleEffect } from "@/hooks/useParticleEffect";
import { Checkbox } from "@/ui/Checkbox";
import { Container } from "@/ui/Container";
import { Dialog } from "@/ui/Dialog";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function RecipeCardModal() {
	const { recipe, mounted, clear, dialogRef } = useRecipeCardModal(
		useShallow((s) => ({
			recipe: s.recipe,
			mounted: s.mounted,
			clear: s.clear,
			dialogRef: s.dialogRef,
		})),
	);

	return (
		<Dialog ref={dialogRef} handleClose={clear}>
			<m.div layoutRoot className={styles.container}>
				{recipe && mounted ? <RecipeCardModalContent recipe={recipe} /> : null}
			</m.div>
		</Dialog>
	);
}

function RecipeCardModalContent({ recipe }: { recipe: RecipeWithSpecs }) {
	const [particlesEnabled, setParticlesEnabled] = useLocalStorage(
		"particles-enabled",
		true,
	);

	const cardRef = useRef<HTMLDivElement>(null);
	const canvasRef = useParticleEffect(cardRef, particlesEnabled);

	const [servings, setServings] = useState(1);
	const deferredServings = useDeferredValue(servings);

	const [conversionSystem, setConversionSystem] = useState<UnitSystems | null>(
		null,
	);

	return (
		<>
			<canvas ref={canvasRef} className={styles.particles} />

			<Container className={styles.content}>
				<Grid gap={4}>
					<MotionRecipeCard
						withMotion
						ref={cardRef}
						recipe={recipe}
						className={styles.card}
					>
						<RecipeCard
							recipe={recipe}
							servings={deferredServings}
							convertUnits={conversionSystem}
							withLink
							nameAdornment={<Icon name="duotone-martini-glass" size={3} />}
						/>
					</MotionRecipeCard>

					<RecipeActions recipe={recipe} withLink />
				</Grid>

				<Grid gap={4}>
					<SelectServings value={deferredServings} onChange={setServings} />

					<SelectUnitConversion
						name="conversionSystem"
						defaultValue={conversionSystem}
						onChange={setConversionSystem}
					/>

					<RecipeMetrics
						recipe={recipe}
						servings={deferredServings}
						convertUnits={conversionSystem}
					/>
				</Grid>
			</Container>

			<Checkbox
				label="Particle effects"
				size="small"
				checked={particlesEnabled}
				onChange={(e) => setParticlesEnabled(e.target.checked)}
				className={styles.particleToggle}
			/>
		</>
	);
}
