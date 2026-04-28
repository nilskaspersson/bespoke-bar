"use client";

import { clsx } from "clsx";
import { m } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { WakeLock } from "@/components/WakeLock";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import {
	RecipeAdjustmentsControls,
	RecipeAdjustmentsProvider,
	useRecipeAdjustments,
} from "@/features/recipes/components/RecipeAdjustments";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import { RecipeMetrics } from "@/features/recipes/metrics/components/RecipeMetrics";
import {
	recipeCardModalStore,
	useRecipeCardModal,
} from "@/features/recipes/stores/recipeCardModal";
import { RecipeTagsAction } from "@/features/tags/components/RecipeTagsAction";
import { useCardTilt } from "@/hooks/useCardTilt";
import { useDialog } from "@/hooks/useDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useParticleEffect } from "@/hooks/useParticleEffect";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Dialog } from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import {
	usePersistenceInfo,
	WithPersistenceInfo,
} from "@/ui/WithPersistenceInfo";
import styles from "./styles.module.css";

const BOXES_VARIANTS = {
	initial: {},
	animate: {
		transition: { staggerChildren: 0.05, delayChildren: 0.25 },
	},
};

const BOX_VARIANTS = {
	initial: { opacity: 0, scale: 0.9, x: -16, y: -8 },
	animate: {
		opacity: 1,
		scale: 1,
		x: 0,
		y: 0,
		transition: { type: "spring", duration: 1.2, bounce: 0.2 },
	},
} as const;

export function RecipeCardModal() {
	const clear = useRecipeCardModal((s) => s.clear);

	const { dialogRef } = useDialog({
		onNavigationClose: clear,
	});

	useEffect(() => {
		recipeCardModalStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { recipe, isFavorite, mounted } = useRecipeCardModal(
		useShallow((s) => ({
			recipe: s.recipe,
			isFavorite: s.isFavorite,
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
			<Button
				className={styles.close}
				onClick={clear}
				icon
				variant="ghost"
				size="small"
				aria-label="Close"
				title="Close"
			>
				<Icon name="xmark" size={5} />
			</Button>

			{recipe && mounted ? (
				<RecipeAdjustmentsProvider>
					<RecipeCardModalContent recipe={recipe} isFavorite={isFavorite} />
				</RecipeAdjustmentsProvider>
			) : null}
		</Dialog>
	);
}

function RecipeCardModalContent({
	recipe,
	isFavorite,
}: {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
}) {
	const clear = useRecipeCardModal((s) => s.clear);
	const setIsFavorite = useRecipeCardModal((s) => s.setIsFavorite);
	const tagOptions = useRecipeCardModal((s) => s.tagOptions);
	const [particlesEnabled, setParticlesEnabled] = useLocalStorage(
		"particles-enabled",
		true,
	);
	const [tiltEnabled, setTiltEnabled] = useLocalStorage(
		"card-tilt-enabled",
		false,
	);

	const cardRef = useRef<HTMLDivElement>(null);
	const canvasRef = useParticleEffect(cardRef, particlesEnabled);
	const tilt = useCardTilt();

	const particlesPersistence = usePersistenceInfo();
	const tiltPersistence = usePersistenceInfo();

	const { deferredServings, conversionSystem, withRounding, withBestUnit } =
		useRecipeAdjustments();

	return (
		<>
			<canvas ref={canvasRef} className={styles.particles} />

			<div className={styles.content}>
				<Grid gap={4} className={styles.primary}>
					<Grid gap={1}>
						<MotionRecipeCard
							withMotion
							ref={cardRef}
							recipe={recipe}
							layout="position"
							onMouseMove={tiltEnabled ? tilt.onMouseMove : undefined}
							onMouseLeave={tiltEnabled ? tilt.onMouseLeave : undefined}
							style={tiltEnabled ? tilt.style : undefined}
						>
							<RecipeCard
								recipe={recipe}
								servings={deferredServings}
								convertUnits={conversionSystem}
								className={styles.card}
								withRounding={withRounding}
								withBestUnit={withBestUnit}
								withLink
								nameAdornment={
									<RecipeNameAdornment servings={deferredServings} />
								}
							/>
						</MotionRecipeCard>

						<Flex gap={4} justifyContent="space-between">
							{tagOptions ? (
								<RecipeTagsAction recipe={recipe} tagOptions={tagOptions} />
							) : null}

							<RecipeCardActions
								recipe={recipe}
								isFavorite={isFavorite}
								onDelete={clear}
								onToggleFavorite={setIsFavorite}
							/>
						</Flex>
					</Grid>

					{recipe.description ? (
						<m.div
							variants={BOXES_VARIANTS}
							initial="initial"
							animate="animate"
							className={styles.meta}
						>
							<m.div variants={BOX_VARIANTS}>
								<div className={styles.box}>
									<Text>{recipe.description}</Text>
								</div>
							</m.div>
						</m.div>
					) : null}
				</Grid>

				<m.div
					className={styles.boxes}
					variants={BOXES_VARIANTS}
					initial="initial"
					animate="animate"
				>
					<m.div variants={BOX_VARIANTS}>
						<div className={styles.box}>
							<RecipeAdjustmentsControls />
						</div>
					</m.div>

					<m.div variants={BOX_VARIANTS}>
						<RecipeMetrics
							recipe={recipe}
							servings={deferredServings}
							convertUnits={conversionSystem}
							className={styles.box}
						/>
					</m.div>

					<m.div
						variants={BOX_VARIANTS}
						className={clsx(styles.box, styles.toggles)}
					>
						<WakeLock size="small" />

						<WithPersistenceInfo
							persistent="local"
							persistence={particlesPersistence}
						>
							<Checkbox
								label="Particle effects"
								size="small"
								checked={particlesEnabled}
								onChange={(e) => {
									setParticlesEnabled(e.target.checked);
									particlesPersistence.notify();
								}}
							/>
						</WithPersistenceInfo>

						<WithPersistenceInfo
							persistent="local"
							persistence={tiltPersistence}
						>
							<Checkbox
								label="3D Card"
								size="small"
								checked={tiltEnabled}
								onChange={(e) => {
									setTiltEnabled(e.target.checked);
									tiltPersistence.notify();
								}}
							/>
						</WithPersistenceInfo>
					</m.div>
				</m.div>
			</div>
		</>
	);
}
