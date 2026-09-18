"use client";

import { Button } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { OCRQuotaIndicator } from "@/features/billing/components/OCRQuotaIndicator";
import { PhotoZoomDialog } from "@/features/recipes/photo/components/PhotoZoomDialog";
import type { PhotoFlow } from "@/features/recipes/photo/hooks/usePhotoFlow";
import styles from "./styles.module.css";

export function PhotoSourceStrip({
	flow,
	className,
	...props
}: { flow: PhotoFlow } & Omit<ComponentProps<"div">, "children">) {
	const zoom = useDialog();
	const { foundRecipeCount, imagePreviewUrl, isFromPhone } = flow;

	return (
		<Flex {...props} gap={4} wrap className={clsx(className, styles.strip)}>
			{imagePreviewUrl ? (
				<Button
					type="button"
					variant="base"
					className={styles.thumb}
					aria-label="Enlarge photo"
					title="Enlarge photo"
					onClick={zoom.showModal}
				>
					<img src={imagePreviewUrl} alt="" className={styles.image} />

					<span className={styles.expand}>
						<Icon name="expand" size={2} />
					</span>
				</Button>
			) : (
				<span className={styles.thumb}>
					<Icon name={isFromPhone ? "mobile" : "image"} size={6} />
				</span>
			)}

			<Grid gap={1} className={styles.info} alignContent="center">
				<Heading level="h6">
					{foundRecipeCount} {foundRecipeCount === 1 ? "Recipe" : "Recipes"}{" "}
					found {isFromPhone ? "in your handoff" : "in your photo"}
				</Heading>

				<Text as="p" size={2}>
					Text extraction can be inaccurate. Double-check extracted Recipes.
				</Text>
			</Grid>

			<OCRQuotaIndicator
				locked={flow.isAtOCRQuotaCap}
				className={styles.quota}
			/>

			<PhotoZoomDialog dialog={zoom} src={imagePreviewUrl} />
		</Flex>
	);
}
