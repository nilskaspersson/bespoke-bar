"use client";

import { Button } from "@bespoke/ui/Button";
import { Chip } from "@bespoke/ui/Chip";
import { Grid } from "@bespoke/ui/Grid";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Icon } from "@bespoke/ui/Icon";
import { Spinner } from "@bespoke/ui/Spinner";
import { Text } from "@bespoke/ui/Text";
import { toCSSVars } from "@bespoke/ui/utils/styles";
import { clsx } from "clsx";
import { type ComponentProps, useState } from "react";
import { OCRQuotaIndicator } from "@/features/billing/components/OCRQuotaIndicator";
import { PhotoScanEffect } from "@/features/recipes/photo/components/PhotoScanEffect";
import { PhotoZoomDialog } from "@/features/recipes/photo/components/PhotoZoomDialog";
import { UploadPhotoForm } from "@/features/recipes/photo/components/UploadPhotoForm";
import type { PhotoFlow } from "@/features/recipes/photo/hooks/usePhotoFlow";
import styles from "./styles.module.css";

export function PhotoStage({
	flow,
	className,
	...props
}: { flow: PhotoFlow } & Omit<ComponentProps<"div">, "children">) {
	const zoom = useDialog();
	const [photoRatio, setPhotoRatio] = useState<number | null>(null);
	const { imagePreviewUrl, isAtOCRQuotaCap, isParsing, hasSelectedImage } =
		flow;

	return (
		<div
			{...props}
			ref={flow.imageRef}
			className={clsx(className, styles.stage)}
		>
			<UploadPhotoForm
				onChange={flow.onImageChange}
				onSuccess={flow.onSubmitPhotoSuccess}
				onParsingChange={flow.onParsingChange}
				onHandoff={flow.openHandoff}
				className={styles.form}
				usageInfo={<OCRQuotaIndicator locked={isAtOCRQuotaCap} />}
				disabled={isAtOCRQuotaCap || hasSelectedImage}
				inert={hasSelectedImage}
			/>

			{hasSelectedImage ? (
				<figure className={styles.photo}>
					{imagePreviewUrl ? (
						<div
							className={clsx(styles.frame, { [styles.scanning]: isParsing })}
							style={toCSSVars({ jsxPhotoRatio: photoRatio ?? undefined })}
						>
							<div className={styles.clip}>
								<img
									src={imagePreviewUrl}
									alt="Your upload"
									className={styles.image}
									onLoad={(event) => {
										const { naturalWidth, naturalHeight } = event.currentTarget;
										setPhotoRatio(naturalWidth / naturalHeight);
									}}
								/>

								{isParsing ? <PhotoScanEffect /> : null}
							</div>
						</div>
					) : (
						<Grid gap={2} justifyItems="center" className={styles.handoff}>
							<Icon name="mobile" size={8} />

							<Text size={2} align="center" heavy>
								From a handoff
							</Text>
						</Grid>
					)}

					<figcaption className={styles.caption}>
						{isParsing ? (
							<Chip size={1} icon={<Spinner size={2} />}>
								Reading your photo…
							</Chip>
						) : (
							<Chip size={1} variant="outline">
								Photo selected
							</Chip>
						)}

						{imagePreviewUrl ? (
							<Button
								type="button"
								variant="clear"
								color="light"
								size="small"
								icon
								rounded
								aria-label="Enlarge photo"
								title="Enlarge photo"
								onClick={zoom.showModal}
							>
								<Icon name="expand" />
							</Button>
						) : null}
					</figcaption>
				</figure>
			) : null}

			<PhotoZoomDialog dialog={zoom} src={imagePreviewUrl} />
		</div>
	);
}
