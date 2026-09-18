import { Flex } from "@bespoke/ui/Flex";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import type { PhotoFlow } from "@/features/recipes/photo/hooks/usePhotoFlow";
import styles from "./styles.module.css";

export type FlowStepState = "idle" | "active" | "done";

export function getFlowStepStates(
	flow: Pick<
		PhotoFlow,
		"hasSelectedImage" | "hasParsedText" | "hasDraftRecipes" | "isParsing"
	>,
): Record<"photo" | "text" | "recipes", FlowStepState> {
	const hasSource = flow.hasSelectedImage || flow.hasParsedText;

	return {
		photo: hasSource && !flow.isParsing ? "done" : "active",
		text: flow.hasParsedText || flow.isParsing ? "active" : "idle",
		recipes: flow.hasDraftRecipes ? "active" : "idle",
	};
}

export function FlowStep({
	step,
	state,
	title,
	hint,
	className,
	...props
}: Omit<ComponentProps<"div">, "children" | "title"> & {
	step: number;
	state: FlowStepState;
	title: ReactNode;
	hint?: ReactNode;
}) {
	return (
		<Flex
			{...props}
			className={clsx(className, styles.step, styles[state])}
			gap={3}
			alignItems="center"
			aria-current={state === "active" ? "step" : undefined}
		>
			<span className={styles.marker}>
				{state === "done" ? (
					<Icon name="check" size={2} />
				) : (
					<Text size={2} weight={700} numeric compact>
						{step}
					</Text>
				)}
			</span>

			<HGroup tagline={hint}>
				<Heading level="h3" size={3}>
					{title}
				</Heading>
			</HGroup>
		</Flex>
	);
}
