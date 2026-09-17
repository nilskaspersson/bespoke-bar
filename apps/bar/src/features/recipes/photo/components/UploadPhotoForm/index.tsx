import { ACCEPTED_IMAGE_TYPES } from "@bespoke/schema/constants";
import { Button } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Divider } from "@bespoke/ui/Divider";
import { FileInput } from "@bespoke/ui/FileInput";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { useConfirm } from "@bespoke/ui/hooks/useConfirm";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { downscaleImage } from "@bespoke/ui/utils/downscaleImage";
import { clsx } from "clsx";
import Link from "next/link";
import type { ChangeEventHandler, ComponentProps } from "react";
import { useCallback, useRef } from "react";
import { OCRProcessingNotice } from "@/features/consent/components/OCRProcessingNotice";
import {
	checkOCRConsent,
	storeOCRConsent,
} from "@/features/consent/ocrConsent";
import { useSubmitPhotoAction } from "@/features/recipes/photo/hooks/useSubmitPhotoAction";
import { useFileDrop } from "@/hooks/useFileDrop";
import { usePasteFile } from "@/hooks/usePasteFile";
import { unwrapAction } from "@/utils/api";
import styles from "./styles.module.css";

export function UploadPhotoForm({
	onSuccess,
	onChange,
	onParsingChange,
	onHandoff,
	className,
	children,
	usageInfo,
	disabled,
	...props
}: Omit<ComponentProps<"form">, "onChange" | "action"> & {
	onSuccess: (extractedText: string) => void;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	onParsingChange?: (parsing: boolean) => void;
	/** Renders the handoff button when given. */
	onHandoff?: () => void;
	usageInfo?: React.ReactNode;
	disabled?: boolean;
}) {
	const {
		action: submitPhotoAction,
		isPending: isParsingPhotoText,
		startLoading,
		dismissLoading,
	} = useSubmitPhotoAction({
		onSuccess: (extractedText) => {
			onSuccess(extractedText);
			onParsingChange?.(false);
		},
		onError: () => onParsingChange?.(false),
	});

	const {
		confirmAction: confirmOCRConsent,
		isPending: isConfirmingOCRConsent,
		resolveAction: acceptOCRConsentPrompt,
		rejectAction: rejectOCRConsentPrompt,
	} = useConfirm();

	const { dialogRef: ocrConsentDialogRef, showModal: showOCRConsentDialog } =
		useDialog();

	const imageInputRef = useRef<HTMLInputElement>(null);

	const ensureOCRConsent = useCallback(async (): Promise<boolean> => {
		if (await checkOCRConsent()) return true;

		showOCRConsentDialog();
		const confirmed = await confirmOCRConsent();

		if (!confirmed) return false;

		try {
			await unwrapAction(storeOCRConsent());
		} catch (error) {
			console.error(error);
		}

		return true;
	}, [confirmOCRConsent, showOCRConsentDialog]);

	const handleDroppedFiles = useCallback((files: FileList) => {
		const input = imageInputRef.current;
		if (!input || input.disabled) return;

		const file = Array.from(files).find(
			(candidate) =>
				ACCEPTED_IMAGE_TYPES.includes(candidate.type) || candidate.type === "",
		);

		if (!file) return;

		/**
		 * Hand the file to the "Select an image" input and fire a native change so
		 * the consent prompt + auto-submit below run exactly as for a manual pick.
		 */
		const data = new DataTransfer();
		data.items.add(file);
		input.files = data.files;
		input.dispatchEvent(new Event("change", { bubbles: true }));
	}, []);

	const { dropZoneRef, isDraggingOver, isFileDragging, dropHandlers } =
		useFileDrop<HTMLFormElement>({
			onFiles: handleDroppedFiles,
		});

	usePasteFile({ onFiles: handleDroppedFiles });

	const fileInputProps: Partial<ComponentProps<typeof FileInput>> = {
		name: "image",
		accept: ACCEPTED_IMAGE_TYPES.join(","),
		disabled: isParsingPhotoText || disabled,
		onChange: async (event) => {
			const file = event.target.files?.[0];

			if (!file) return;

			onChange?.(event);

			onParsingChange?.(true);
			startLoading();

			const downscaling = downscaleImage(file);

			if (!(await ensureOCRConsent())) {
				dismissLoading();
				onParsingChange?.(false);
				return;
			}

			const formData = new FormData();
			formData.append("image", await downscaling);
			await submitPhotoAction(formData);
		},
	};

	return (
		<form
			{...props}
			ref={dropZoneRef}
			{...dropHandlers}
			className={clsx(styles.base, className, {
				[styles.draggingOver]: isDraggingOver,
			})}
		>
			{isFileDragging ? (
				<div className={styles.overlay}>
					<Icon name="arrow-down-to-dotted-line" size={6} />

					<Text size={3} weight={600} heavy align="center">
						{isDraggingOver ? "Release to parse recipes!" : "Drop file here."}
					</Text>
				</div>
			) : null}

			{usageInfo ? <div className={styles.usageInfo}>{usageInfo}</div> : null}

			<Grid gap={6} justifyItems="center">
				<Heading level="h2" size={4} align="center">
					Upload an image of a recipe
				</Heading>

				<Grid gap={2} justifyItems="center">
					<FileInput
						{...fileInputProps}
						ref={imageInputRef}
						buttonProps={{
							variant: "solid",
							color: "accent",
						}}
					>
						<Icon name="image" /> Select an image
					</FileInput>

					<Divider className={styles.divider}>or</Divider>

					<FileInput
						{...fileInputProps}
						capture="environment"
						className={styles.captureButton}
						buttonProps={{
							variant: "outline",
							color: "accent",
						}}
					>
						<Icon name="camera" /> Take a photo
					</FileInput>

					{onHandoff ? (
						<Button
							type="button"
							variant="outline"
							color="accent"
							className={styles.handoffButton}
							disabled={disabled || isParsingPhotoText}
							onClick={async () => {
								if (!(await ensureOCRConsent())) return;
								onHandoff();
							}}
						>
							<Icon name="qr-code" /> Take a photo with your phone
						</Button>
					) : null}

					<Text heavy size={2} className={styles.dropHint}>
						Drag & drop, or paste an image
					</Text>
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
							<OCRProcessingNotice />
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
