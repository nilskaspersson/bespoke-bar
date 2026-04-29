"use client";

import { clsx } from "clsx";
import { m } from "motion/react";
import {
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from "react";
import { WakeLock } from "@/components/WakeLock";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
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
import { findRecipeCardEl } from "@/features/recipes/utils/recipeCardSource";
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
import { TRANSITION_DURATION_SLOW_MS } from "@/utils/animate";
import { readCssVar } from "@/utils/styles";
import styles from "./styles.module.css";

const TRANSITION_DURATION = TRANSITION_DURATION_SLOW_MS;
const TRANSITION_EASING = readCssVar("--swift-in");

/**
 * Spawns a detached DOM clone of the modal card at its current position and
 * animates it back to the list-card with the matching `data-recipe-id`. The
 * clone lives at body level so the dialog can close immediately while the
 * card keeps animating.
 */
function spawnExitClone(cardEl: HTMLElement, recipeId: string) {
	const fromRect = cardEl.getBoundingClientRect();

	if (fromRect.width === 0 || fromRect.height === 0) {
		recipeCardModalStore.getState().close();
		return;
	}

	recipeCardModalStore.getState().closeWithExit(recipeId);

	const clone = cardEl.cloneNode(true) as HTMLElement;

	Object.assign(clone.style, {
		position: "absolute",
		top: `${fromRect.top + window.scrollY}px`,
		left: `${fromRect.left + window.scrollX}px`,
		width: `${fromRect.width}px`,
		height: `${fromRect.height}px`,
		margin: "0",
		zIndex: "var(--z-modal)",
		pointerEvents: "none",
	});

	document.body.appendChild(clone);

	const sourceEl = findRecipeCardEl(recipeId);
	const targetRect = sourceEl?.getBoundingClientRect();

	const keyframes =
		targetRect && targetRect.width > 0
			? [
					{ transform: "none", opacity: 1 },
					{
						transform: `translate(${targetRect.left - fromRect.left}px, ${targetRect.top - fromRect.top}px)`,
						opacity: 1,
					},
				]
			: [
					{ opacity: 1, transform: "none" },
					{ opacity: 0, transform: "scale(0.92)" },
				];

	const animation = clone.animate(keyframes, {
		duration: TRANSITION_DURATION,
		easing: TRANSITION_EASING,
		fill: "forwards",
	});
	const cleanup = () => {
		clone.remove();
		recipeCardModalStore.getState().finishExit(recipeId);
	};
	animation.onfinish = cleanup;
	animation.oncancel = cleanup;
}

export function RecipeCardModal() {
	const close = useRecipeCardModal((s) => s.close);
	const cardRef = useRef<HTMLDivElement>(null);

	const { dialogRef } = useDialog({
		onNavigationClose: close,
	});

	useEffect(() => {
		recipeCardModalStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const current = useRecipeCardModal((s) => s.current);

	useLayoutEffect(() => {
		if (!current && dialogRef.current?.open) {
			dialogRef.current.close();
		}
	}, [current, dialogRef]);

	const handleClose = useCallback(() => {
		const cardEl = cardRef.current;
		const recipeId = current?.recipe.id;
		if (cardEl && recipeId) {
			spawnExitClone(cardEl, recipeId);
		} else {
			close();
		}
		if (recipeId) {
			findRecipeCardEl(recipeId)?.focus({ preventScroll: true });
		}
	}, [close, current]);

	return (
		<Dialog
			ref={dialogRef}
			isOpen
			onCancel={(event) => {
				if (event.target !== event.currentTarget) return;
				event.preventDefault();
				handleClose();
			}}
		>
			<Button
				className={styles.close}
				onClick={handleClose}
				icon
				variant="ghost"
				size="small"
				aria-label="Close"
				title="Close"
			>
				<Icon name="xmark" size={5} />
			</Button>

			{current ? (
				<RecipeAdjustmentsProvider>
					<RecipeCardModalContent
						recipe={current.recipe}
						isFavorite={current.isFavorite}
						tagOptions={current.tagOptions}
						sourceRect={current.sourceRect}
						cardRef={cardRef}
						onRequestClose={handleClose}
					/>
				</RecipeAdjustmentsProvider>
			) : null}
		</Dialog>
	);
}

type ContentProps = {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions: Tag[] | null;
	sourceRect: DOMRect | null;
	cardRef: RefObject<HTMLDivElement | null>;
	onRequestClose: () => void;
};

function RecipeCardModalContent({
	recipe,
	isFavorite,
	tagOptions,
	sourceRect,
	cardRef,
	onRequestClose,
}: ContentProps) {
	const [particlesEnabled, setParticlesEnabled] = useLocalStorage(
		"particles-enabled",
		true,
	);
	const [tiltEnabled, setTiltEnabled] = useLocalStorage(
		"card-tilt-enabled",
		false,
	);

	const canvasRef = useParticleEffect(cardRef, particlesEnabled);

	const particlesPersistence = usePersistenceInfo();
	const tiltPersistence = usePersistenceInfo();

	return (
		<>
			<canvas ref={canvasRef} className={styles.particles} />

			<div className={styles.content}>
				<Grid gap={4} className={styles.primary}>
					<CardSection
						recipe={recipe}
						isFavorite={isFavorite}
						tagOptions={tagOptions}
						sourceRect={sourceRect}
						cardRef={cardRef}
						tiltEnabled={tiltEnabled}
						onRequestClose={onRequestClose}
					/>

					{recipe.description ? (
						<div className={styles.meta}>
							<div className={styles.box}>
								<Text>{recipe.description}</Text>
							</div>
						</div>
					) : null}
				</Grid>

				<BoxesSection
					recipe={recipe}
					particlesEnabled={particlesEnabled}
					tiltEnabled={tiltEnabled}
					onParticlesChange={setParticlesEnabled}
					onTiltChange={setTiltEnabled}
					particlesPersistence={particlesPersistence}
					tiltPersistence={tiltPersistence}
				/>
			</div>
		</>
	);
}

type CardSectionProps = {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions: Tag[] | null;
	sourceRect: DOMRect | null;
	cardRef: RefObject<HTMLDivElement | null>;
	tiltEnabled: boolean;
	onRequestClose: () => void;
};

function CardSection({
	recipe,
	isFavorite,
	tagOptions,
	sourceRect,
	cardRef,
	tiltEnabled,
	onRequestClose,
}: CardSectionProps) {
	const setIsFavorite = useRecipeCardModal((s) => s.setIsFavorite);
	const tilt = useCardTilt();

	const { deferredServings, conversionSystem, withRounding, withBestUnit } =
		useRecipeAdjustments();

	/**
	 * Entry FLIP: measure the card's natural rect, compute the delta from the
	 * source rect, and animate identity transform from there.
	 */
	useLayoutEffect(() => {
		const node = cardRef.current;

		if (!node || !sourceRect) {
			return;
		}

		const finalRect = node.getBoundingClientRect();

		if (finalRect.width === 0 || finalRect.height === 0) {
			return;
		}

		const dx = sourceRect.left - finalRect.left;
		const dy = sourceRect.top - finalRect.top;
		const animation = node.animate(
			[{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
			{
				duration: TRANSITION_DURATION,
				easing: TRANSITION_EASING,
				fill: "backwards",
			},
		);

		return () => animation.cancel();
	}, [sourceRect, cardRef]);

	const card = (
		<RecipeCard
			recipe={recipe}
			servings={deferredServings}
			convertUnits={conversionSystem}
			className={styles.card}
			withRounding={withRounding}
			withBestUnit={withBestUnit}
			withLink
			nameAdornment={<RecipeNameAdornment servings={deferredServings} />}
		/>
	);

	return (
		<Grid gap={1}>
			<div ref={cardRef}>
				{tiltEnabled ? (
					<m.div
						onMouseMove={tilt.onMouseMove}
						onMouseLeave={tilt.onMouseLeave}
						style={tilt.style}
					>
						{card}
					</m.div>
				) : (
					card
				)}
			</div>

			<Flex gap={4} justifyContent="space-between">
				{tagOptions ? (
					<RecipeTagsAction recipe={recipe} tagOptions={tagOptions} />
				) : null}

				<RecipeCardActions
					recipe={recipe}
					isFavorite={isFavorite}
					onDelete={onRequestClose}
					onToggleFavorite={setIsFavorite}
				/>
			</Flex>
		</Grid>
	);
}

type BoxesSectionProps = {
	recipe: RecipeWithRelations;
	particlesEnabled: boolean;
	tiltEnabled: boolean;
	onParticlesChange: (value: boolean) => void;
	onTiltChange: (value: boolean) => void;
	particlesPersistence: ReturnType<typeof usePersistenceInfo>;
	tiltPersistence: ReturnType<typeof usePersistenceInfo>;
};

function BoxesSection({
	recipe,
	particlesEnabled,
	tiltEnabled,
	onParticlesChange,
	onTiltChange,
	particlesPersistence,
	tiltPersistence,
}: BoxesSectionProps) {
	const { deferredServings, conversionSystem } = useRecipeAdjustments();

	return (
		<div className={styles.boxes}>
			<div className={styles.box}>
				<RecipeAdjustmentsControls />
			</div>

			<RecipeMetrics
				recipe={recipe}
				servings={deferredServings}
				convertUnits={conversionSystem}
				className={styles.box}
			/>

			<div className={clsx(styles.box, styles.toggles)}>
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
							onParticlesChange(e.target.checked);
							particlesPersistence.notify();
						}}
					/>
				</WithPersistenceInfo>

				<WithPersistenceInfo persistent="local" persistence={tiltPersistence}>
					<Checkbox
						label="3D Card"
						size="small"
						checked={tiltEnabled}
						onChange={(e) => {
							onTiltChange(e.target.checked);
							tiltPersistence.notify();
						}}
					/>
				</WithPersistenceInfo>
			</div>
		</div>
	);
}
