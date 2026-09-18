"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { DraftRecipesPreview } from "@bespoke/ui/DraftRecipesPreview";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import {
	FlowStep,
	getFlowStepStates,
} from "@/features/recipes/photo/components/FlowStep";
import { PhotoDraftEditor } from "@/features/recipes/photo/components/PhotoDraftEditor";
import { PhotoFlowActions } from "@/features/recipes/photo/components/PhotoFlowActions";
import { PhotoSourceStrip } from "@/features/recipes/photo/components/PhotoSourceStrip";
import { PhotoStage } from "@/features/recipes/photo/components/PhotoStage";
import { usePhotoFlow } from "@/features/recipes/photo/hooks/usePhotoFlow";
import styles from "./styles.module.css";

const STEPS = {
	photo: {
		step: 1,
		title: "Add a photo",
		hint: "One photo can hold several Recipes.",
	},
	text: {
		step: 2,
		title: "Check the text",
		hint: "Edit extracted Recipes in the editor.",
	},
	recipes: {
		step: 3,
		title: "Create",
		hint: "Preview the Recipes that will be created.",
	},
} as const;

export function PhotoToRecipe({
	ingredients,
	className,
	...props
}: { ingredients: Ingredient[] } & Omit<ComponentProps<"div">, "children">) {
	const flow = usePhotoFlow(ingredients);
	const steps = getFlowStepStates(flow);

	return (
		<Grid
			{...props}
			ref={flow.rootRef}
			gap={4}
			className={clsx(className, styles.root)}
		>
			{flow.hasParsedText ? (
				<div className={styles.review}>
					<Grid gap={4} className={styles.source}>
						<FlowStep {...STEPS.photo} state={steps.photo} />
						<PhotoSourceStrip flow={flow} />
					</Grid>

					<Grid gap={4} className={styles.editor}>
						<FlowStep {...STEPS.text} state={steps.text} />
						<PhotoDraftEditor flow={flow} ingredients={ingredients} />
					</Grid>

					<Grid gap={4}>
						<FlowStep {...STEPS.recipes} state={steps.recipes} />
						<DraftRecipesPreview recipes={flow.draftRecipes} />
					</Grid>
				</div>
			) : (
				<Grid className={styles.intro} alignItems="stretch" gap={6}>
					<Grid as="section" gap={4}>
						<Heading level="h2" size={5}>
							How it works
						</Heading>

						<ol className={styles.steps}>
							<li>
								<FlowStep {...STEPS.photo} state={steps.photo} />
							</li>

							<li>
								<FlowStep {...STEPS.text} state={steps.text} />
							</li>

							<li>
								<FlowStep {...STEPS.recipes} state={steps.recipes} />
							</li>
						</ol>
					</Grid>

					<PhotoStage flow={flow} />
				</Grid>
			)}

			<PhotoFlowActions flow={flow} />
		</Grid>
	);
}
