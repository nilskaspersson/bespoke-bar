"use client";

import type { HandoffEndedReason } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { appErrorSchema, getAppErrorToast } from "@bespoke/schema/appError";
import { ACCEPTED_IMAGE_TYPES } from "@bespoke/schema/constants";
import { Callout } from "@bespoke/ui/Callout";
import { FileInput } from "@bespoke/ui/FileInput";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { toast } from "@bespoke/ui/Toast";
import { type ComponentProps, useEffect, useState } from "react";
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

function handoffEndpoint(nonce: string, action?: "open") {
	const base = `/api/photo/handoff/${nonce}`;
	return action ? `${base}/${action}` : base;
}

export function HandoffCapture({ nonce }: { nonce: string }) {
	const [state, setState] = useState<CaptureState>({ kind: "idle" });

	/**
	 * Done from the client so link previews don't count as a scan. Failing
	 * silently is fine, the photo can still go through.
	 */
	useEffect(() => {
		let cancelled = false;

		void fetch(handoffEndpoint(nonce, "open"), { method: "POST" })
			.then(async (res) => {
				if (cancelled || !isEndedStatus(res.status)) return;

				const json: unknown = await res.json().catch(() => null);
				const reason =
					json && typeof json === "object" && "reason" in json
						? json.reason
						: undefined;
				setState({ kind: "ended", reason: endedReason(reason) });
			})
			.catch(() => {});

		return () => {
			cancelled = true;
		};
	}, [nonce]);

	async function submit(file: File) {
		setState({ kind: "submitting" });
		const toastId = toast.loading("Processing image…");

		const formData = new FormData();
		formData.append("image", file);

		try {
			const res = await fetch(handoffEndpoint(nonce), {
				method: "POST",
				body: formData,
			});
			const json = await res.json();

			if (json.ok) {
				toast.success("Sent to your desktop", { id: toastId });
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
					Sent to your desktop
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
		<Grid gap={6} justifyItems="center" className={styles.base}>
			<Grid gap={2} justifyItems="center">
				<Heading level="h1" size={5} align="center">
					Take a photo of the recipe
				</Heading>

				<Text as="p" align="center" heavy>
					The extracted text appears on your desktop a moment later.
				</Text>
			</Grid>

			<Grid gap={2} justifyItems="center">
				<FileInput
					{...fileInputProps}
					capture="environment"
					buttonProps={{ variant: "solid", color: "accent", size: "large" }}
				>
					<Icon name="camera" /> Take a photo
				</FileInput>

				<FileInput
					{...fileInputProps}
					buttonProps={{ variant: "outline", color: "accent" }}
				>
					<Icon name="image" /> Choose from library
				</FileInput>
			</Grid>

			<Callout variant="solid" color="light" icon="circle-info" size={1}>
				Images are processed by Google for text extraction. Bespoke Bar does not
				store them.
			</Callout>
		</Grid>
	);
}
