"use client";

import { BottomRailItems } from "@bespoke/ui/BottomRail";
import { Button } from "@bespoke/ui/Button";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Kbd } from "@bespoke/ui/Kbd";
import { Text } from "@bespoke/ui/Text";
import { HandoffDialog } from "@/features/recipes/photo/components/HandoffDialog";
import type { PhotoFlow } from "@/features/recipes/photo/hooks/usePhotoFlow";

export function PhotoFlowActions({ flow }: { flow: PhotoFlow }) {
	const { draftRecipes, hasDraftRecipes } = flow;

	return (
		<>
			<HandoffDialog
				dialog={flow.handoffDialog}
				link={flow.handoff.link}
				isMinting={flow.handoff.isMinting}
				canRenew={flow.handoff.canRenew}
				onRenew={flow.handoff.renew}
				onResult={flow.onHandoffResult}
			/>

			<BottomRailItems>
				{flow.canReset ? (
					<ConfirmAction
						action={async () => {
							flow.reset();
						}}
						actionLabel="Clear form"
						buttonProps={{
							variant: "clear",
							color: "amber",
							rounded: true,
							size: "default",
						}}
						notice="Extracting an image again will count as another use this month."
						description={
							<Text as="p" heavy>
								This clears the selected image and any Recipes extracted from
								it.
							</Text>
						}
					>
						Reset
					</ConfirmAction>
				) : null}

				<Button
					variant="clear"
					rounded
					color="accent"
					aria-disabled={!hasDraftRecipes}
					onClick={hasDraftRecipes ? flow.submit : undefined}
					endAdornment={
						<Kbd
							shortcut="mod+enter"
							variant="ghost"
							ignoreInputEvents={false}
						/>
					}
				>
					{hasDraftRecipes
						? `Create ${draftRecipes.length} ${draftRecipes.length > 1 ? "recipes" : "recipe"}`
						: "Create"}
				</Button>
			</BottomRailItems>
		</>
	);
}
