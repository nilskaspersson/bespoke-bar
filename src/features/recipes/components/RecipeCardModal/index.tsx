"use client";

import { m } from "motion/react";
import {
	useDeferredValue,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useShallow } from "zustand/react/shallow";
import { WakeLock } from "@/components/WakeLock";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import { SelectServings } from "@/features/recipes/components/SelectServings";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import { RecipeMetrics } from "@/features/recipes/metrics/components/RecipeMetrics";
import {
	recipeCardModalStore,
	useRecipeCardModal,
} from "@/features/recipes/stores/recipeCardModal";
import type { UnitSystems } from "@/features/units/utils/convert";
import { useDialog } from "@/hooks/useDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useParticleEffect } from "@/hooks/useParticleEffect";
import { Checkbox } from "@/ui/Checkbox";
import { Container } from "@/ui/Container";
import { Dialog } from "@/ui/Dialog";
import { Grid } from "@/ui/Grid";
import styles from "./styles.module.css";

export function RecipeCardModal() {
	const clear = useRecipeCardModal((s) => s.clear);

	const { dialogRef } = useDialog({
		onNavigationClose: clear,
	});

	useEffect(() => {
		recipeCardModalStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { recipe, mounted } = useRecipeCardModal(
		useShallow((s) => ({
			recipe: s.recipe,
			mounted: s.mounted,
		})),
	);

	useLayoutEffect(() => {
		if (!mounted && dialogRef.current?.open) {
			dialogRef.current.close();
		}
	}, [mounted, dialogRef]);

	return (
		<Dialog
			ref={dialogRef}
			isOpen
			onCancel={(event) => {
				if (event.target !== event.currentTarget) return;
				event.preventDefault();
				clear();
			}}
		>
			<m.div layoutRoot className={styles.container}>
				{recipe && mounted ? <RecipeCardModalContent recipe={recipe} /> : null}
			</m.div>
		</Dialog>
	);
}

function RecipeCardModalContent({ recipe }: { recipe: RecipeWithSpecs }) {
	const clear = useRecipeCardModal((s) => s.clear);
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
	const [snap, setSnap] = useState(false);

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
						layout="position"
					>
						<RecipeCard
							recipe={recipe}
							servings={deferredServings}
							convertUnits={conversionSystem}
							snap={snap}
							withLink
							nameAdornment={
								<RecipeNameAdornment servings={deferredServings} />
							}
						/>
					</MotionRecipeCard>

					<RecipeActions recipe={recipe} withLink onDelete={clear} />
				</Grid>

				<Grid gap={4}>
					<SelectServings value={deferredServings} onChange={setServings} />

					<SelectUnitConversion
						name="conversionSystem"
						defaultValue={conversionSystem}
						onChange={setConversionSystem}
					/>

					{conversionSystem ? (
						<Checkbox
							label="With rounding"
							size="small"
							checked={snap}
							onChange={(e) => setSnap(e.target.checked)}
						/>
					) : null}

					<RecipeMetrics
						recipe={recipe}
						servings={deferredServings}
						convertUnits={conversionSystem}
					/>
				</Grid>
			</Container>

			<div className={styles.toggles}>
				<WakeLock size="small" />
				<Checkbox
					label="Particle effects"
					size="small"
					checked={particlesEnabled}
					onChange={(e) => setParticlesEnabled(e.target.checked)}
				/>
			</div>
		</>
	);
}
