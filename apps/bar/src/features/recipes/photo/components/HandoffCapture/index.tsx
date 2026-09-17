"use client";

import type { HandoffEndedReason } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { appErrorSchema, getAppErrorToast } from "@bespoke/schema/appError";
import { ACCEPTED_IMAGE_TYPES } from "@bespoke/schema/constants";
import { Callout } from "@bespoke/ui/Callout";
import { Divider } from "@bespoke/ui/Divider";
import { FileInput } from "@bespoke/ui/FileInput";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Panel } from "@bespoke/ui/Panel";
import { Text } from "@bespoke/ui/Text";
import { toast } from "@bespoke/ui/Toast";
import { type ComponentProps, useState } from "react";
import { OCRProcessingNotice } from "@/features/consent/components/OCRProcessingNotice";
import { HandoffEnded } from "@/features/recipes/photo/components/HandoffEnded";
import styles from "./styles.module.css";

type CaptureState =
	| { kind: "idle" }
	| { kind: "submitting" }
	| { kind: "sent" }
	| { kind: "ended"; reason: HandoffEndedReason };

const ENDED_REASONS: readonly HandoffEndedReason[] = ["expired", "closed"];

function endedReason(value: unknown): HandoffEndedReason {
	return (ENDED_REASONS as readonly unknown[]).includes(value)
		? (value as HandoffEndedReason)
		: "expired";
}

function isEndedStatus(status: number) {
	return status === 410;
}

export function HandoffCapture({ nonce }: { nonce: string }) {
	const [state, setState] = useState<CaptureState>({ kind: "idle" });

	async function submit(file: File) {
		setState({ kind: "submitting" });
		const toastId = toast.loading("Processing image…");

		const formData = new FormData();
		formData.append("image", file);

		try {
			const res = await fetch(`/api/photo/handoff/${nonce}`, {
				method: "POST",
				body: formData,
			});
			const json = await res.json();

			if (json.ok) {
				toast.success("Extraction completed", { id: toastId });
				setState({ kind: "sent" });
				return;
			}

			if (isEndedStatus(res.status)) {
				toast.dismiss(toastId);
				setState({ kind: "ended", reason: endedReason(json.reason) });
				return;
			}

			const appError = appErrorSchema.safeParse(json.error);
			const { message, description } = appError.success
				? getAppErrorToast(appError.data)
				: {
						message: "Error processing image",
						description: json.error?.message ?? "Try another photo.",
					};
			toast.error(message, { id: toastId, description });
			setState({ kind: "idle" });
		} catch {
			toast.error("Error processing image", {
				id: toastId,
				description: "Check your connection and try again.",
			});
			setState({ kind: "idle" });
		}
	}

	if (state.kind === "ended") {
		return <HandoffEnded reason={state.reason} />;
	}

	if (state.kind === "sent") {
		return (
			<Grid gap={3} justifyItems="center" className={styles.base}>
				<Icon name="circle-check" size={7} className={styles.sentIcon} />

				<Heading level="h1" size={5} align="center">
					Extraction completed
				</Heading>

				<Text as="p" align="center" heavy>
					The recipe text is on its way. You can close this page.
				</Text>
			</Grid>
		);
	}

	const busy = state.kind === "submitting";

	const fileInputProps: Partial<ComponentProps<typeof FileInput>> = {
		name: "image",
		accept: ACCEPTED_IMAGE_TYPES.join(","),
		disabled: busy,
		onChange: (event) => {
			const file = event.target.files?.[0];
			if (file) {
				void submit(file);
			}
		},
	};

	return (
		<Grid gap={6} justifyItems="center">
			<Panel
				footer={
					<Callout variant="solid" color="light" icon="circle-info" size={1}>
						<OCRProcessingNotice />
					</Callout>
				}
			>
				<Grid gap={6} className={styles.content}>
					<Grid gap={2} justifyItems="center">
						<Heading level="h1" size={5} align="center">
							Take a photo of a recipe
						</Heading>

						<Text as="p" align="center" heavy>
							The extracted text appears on your other device a moment later.
						</Text>
					</Grid>

					<Grid gap={2} justifyItems="center">
						<FileInput
							{...fileInputProps}
							capture="environment"
							buttonProps={{ variant: "solid", color: "accent" }}
						>
							<Icon name="camera" /> Take a photo
						</FileInput>

						<Divider className={styles.divider}>or</Divider>

						<FileInput
							{...fileInputProps}
							buttonProps={{ variant: "outline", color: "accent" }}
						>
							<Icon name="image" /> Choose from library
						</FileInput>
					</Grid>
				</Grid>
			</Panel>
		</Grid>
	);
}
