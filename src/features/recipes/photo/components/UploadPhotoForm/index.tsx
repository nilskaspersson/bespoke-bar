import type { ChangeEventHandler, ComponentProps } from "react";
import { ACCEPTED_IMAGE_TYPES } from "@/constants";
import { useSubmitPhotoAction } from "@/features/recipes/photo/hooks/useSubmitPhotoAction";
import { Callout } from "@/ui/Callout";
import { FileInput } from "@/ui/FileInput";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function UploadPhotoForm({
	onSuccess,
	onChange,
	...props
}: Omit<ComponentProps<"form">, "onChange" | "children" | "action"> & {
	onSuccess: (extractedText: string) => void;
	onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
	const { action: submitPhotoAction, isPending: isParsingPhotoText } =
		useSubmitPhotoAction({ onSuccess });

	const fileInputProps: Partial<ComponentProps<typeof FileInput>> = {
		name: "image",
		accept: ACCEPTED_IMAGE_TYPES.join(","),
		disabled: isParsingPhotoText,
		onChange: (event) => {
			onChange?.(event);

			/**
			 * Automatically submit the form
			 */
			event.target.form?.requestSubmit();
		},
	};

	return (
		<form {...props} action={submitPhotoAction}>
			<Grid gap={6} justifyItems="center" className={styles.inset}>
				<Heading level="h2" size={4}>
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

				<Callout variant="solid" color="regular" icon="circle-info" size={2}>
					Any number of recipes can be extracted from one image.
				</Callout>
			</Grid>
		</form>
	);
}
