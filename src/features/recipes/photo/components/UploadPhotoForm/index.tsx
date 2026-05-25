import { clsx } from "clsx";
import Link from "next/link";
import type { ChangeEventHandler, ComponentProps } from "react";
import { ACCEPTED_IMAGE_TYPES } from "@/constants";
import {
	checkOCRConsent,
	storeOCRConsent,
} from "@/features/consent/ocrConsent";
import { useSubmitPhotoAction } from "@/features/recipes/photo/hooks/useSubmitPhotoAction";
import { useConfirm } from "@/hooks/useConfirm";
import { useDialog } from "@/hooks/useDialog";
import { Callout } from "@/ui/Callout";
import { Chip } from "@/ui/Chip";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { FileInput } from "@/ui/FileInput";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { unwrapAction } from "@/utils/api";
import styles from "./styles.module.css";

export function UploadPhotoForm({
	onSuccess,
	onChange,
	className,
	children,
	usageInfo,
	...props
}: Omit<ComponentProps<"form">, "onChange" | "action"> & {
	onSuccess: (extractedText: string) => void;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	usageInfo?: React.ReactNode;
}) {
	const {
		action: submitPhotoAction,
		isPending: isParsingPhotoText,
		startLoading,
		dismissLoading,
	} = useSubmitPhotoAction({ onSuccess });

	const {
		confirmAction: confirmOCRConsent,
		isPending: isConfirmingOCRConsent,
		resolveAction: acceptOCRConsentPrompt,
		rejectAction: rejectOCRConsentPrompt,
	} = useConfirm();

	const { dialogRef: ocrConsentDialogRef, showModal: showOCRConsentDialog } =
		useDialog();

	const fileInputProps: Partial<ComponentProps<typeof FileInput>> = {
		name: "image",
		accept: ACCEPTED_IMAGE_TYPES.join(","),
		disabled: isParsingPhotoText,
		onChange: async (event) => {
			onChange?.(event);

			startLoading();

			const isOCRConsentConfirmed = await checkOCRConsent();

			if (!isOCRConsentConfirmed) {
				showOCRConsentDialog();
				const confirmed = await confirmOCRConsent();

				if (!confirmed) {
					dismissLoading();
					return;
				}

				try {
					await unwrapAction(storeOCRConsent());
				} catch (error) {
					console.error(error);
				}
			}

			/**
			 * Automatically submit the form
			 */
			event.target.form?.requestSubmit();
		},
	};

	return (
		<form
			{...props}
			action={submitPhotoAction}
			className={clsx(styles.base, className)}
		>
			{usageInfo ? (
				<Chip
					className={styles.usageInfo}
					size={1}
					variant="outline"
					color="amber"
				>
					{usageInfo}
				</Chip>
			) : null}

			<Grid gap={6} justifyItems="center">
				<Heading level="h2" size={4} align="center">
					Upload an image of a recipe
				</Heading>

				<Grid gap={2} justifyItems="center">
					<FileInput
						{...fileInputProps}
						buttonProps={{
							variant: "solid",
							color: "accent",
						}}
					>
						<Icon name="image" /> Select an image
					</FileInput>

					<Text className={styles.separator} size={2}>
						<span>or</span>
					</Text>

					<FileInput
						{...fileInputProps}
						capture="environment"
						buttonProps={{
							variant: "outline",
							color: "accent",
						}}
					>
						<Icon name="camera" /> Take a photo
					</FileInput>
				</Grid>

				<Callout variant="solid" color="light" icon="circle-info" size={1}>
					Multiple recipes can be extracted from an image.
				</Callout>

				{children}
			</Grid>

			<ConfirmAction.Alert
				ref={ocrConsentDialogRef}
				isOpen={isConfirmingOCRConsent}
				heading="Image Processing"
				acceptLabel="I understand and accept"
				description={
					<Grid gap={3}>
						<Text as="p">
							Images are processed by Google for text extraction. Bespoke Bar
							does not store these images.
						</Text>

						<Callout
							variant="solid"
							color="regular"
							icon="circle-info"
							size={2}
						>
							Read the full <Link href="/privacy">privacy policy</Link> and{" "}
							<Link href="/terms">terms & conditions</Link>.
						</Callout>
					</Grid>
				}
				onClose={rejectOCRConsentPrompt}
				resolveAction={acceptOCRConsentPrompt}
				buttonProps={{
					color: "accent",
				}}
			/>
		</form>
	);
}
