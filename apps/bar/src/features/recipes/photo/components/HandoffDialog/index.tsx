"use client";

import type {
	HandoffPhase,
	MintedHandoff,
} from "@bespoke/api/recipes/photo/handoff/handoff.service";
import {
	HANDOFF_LINK_TTL_MS,
	HANDOFF_RESULT_GRACE_MS,
} from "@bespoke/domain/photoHandoff/constants";
import { AppError } from "@bespoke/schema/appError";
import { Alert } from "@bespoke/ui/Alert";
import { Button } from "@bespoke/ui/Button";
import { CopyToClipboard } from "@bespoke/ui/CopyToClipboard";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Icon } from "@bespoke/ui/Icon";
import { Spinner } from "@bespoke/ui/Spinner";
import { Text } from "@bespoke/ui/Text";
import { toast } from "@bespoke/ui/Toast";
import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { showOCRQuotaReachedToast } from "@/features/billing/components/OCRQuotaReachedToast";
import { mintHandoffLink } from "@/features/recipes/photo/api/mintHandoffLink";
import { trpc } from "@/trpc/client";
import { getErrorToast, unwrapAction } from "@/utils/api";
import styles from "./styles.module.css";

const TTL_MINUTES = Math.round(HANDOFF_LINK_TTL_MS / 60_000);

/**
 * 2s growing 1.5x per poll up to 10s while waiting for a scan, then a flat 2s
 * once the phone is connected.
 */
const POLL_INITIAL_MS = 2_000;
const POLL_GROWTH = 1.5;
const POLL_CAP_MS = 10_000;
const POLL_OPENED_MS = 2_000;

const TERMINAL_PHASES = new Set<HandoffPhase>(["done", "closed", "expired"]);

/** Errors that mean the handoff is dead, as opposed to a flaky connection. */
const TERMINAL_ERROR_CODES = new Set([
	"BAD_REQUEST",
	"FORBIDDEN",
	"PRECONDITION_FAILED",
]);

function isTerminal(phase: HandoffPhase | undefined) {
	return phase !== undefined && TERMINAL_PHASES.has(phase);
}

function StatusLine({ phase }: { phase: HandoffPhase | undefined }) {
	switch (phase) {
		case "opened":
			return (
				<Flex gap={2} alignItems="center" className={styles.connected}>
					<Icon name="circle-check" size={3} />
					<Text as="span" heavy>
						Phone connected. Take the photo there.
					</Text>
				</Flex>
			);
		case "expired":
			return (
				<Text as="span" heavy>
					This code has expired. Get a new one to continue.
				</Text>
			);
		case "closed":
			return (
				<Text as="span" heavy>
					This handoff has ended.
				</Text>
			);
		case "done":
			return (
				<Text as="span" heavy>
					Received.
				</Text>
			);
		default:
			return (
				<Flex gap={2} alignItems="center">
					<Spinner size={3} />
					<Text as="span" heavy>
						Scan the code with your phone's camera.
					</Text>
				</Flex>
			);
	}
}

export function HandoffDialog({
	onResult,
	onClose,
}: {
	onResult: (extractedText: string) => void;
	onClose: () => void;
}) {
	const { dialogRef, isOpen, showModal, closeModal } = useDialog();
	const [minted, setMinted] = useState<MintedHandoff | null>(null);
	const [isMinting, setIsMinting] = useState(false);

	const utils = trpc.useUtils();
	const { mutate: closeOnServer } = trpc.handoff.close.useMutation();

	const mint = useCallback(async (): Promise<boolean> => {
		setIsMinting(true);
		try {
			setMinted(await unwrapAction(mintHandoffLink()));
			return true;
		} catch (error) {
			if (
				error instanceof AppError &&
				error.payload.code === "OCR_QUOTA_REACHED"
			) {
				showOCRQuotaReachedToast(error.payload);
			} else {
				const { message, description } = getErrorToast(error, {
					message: "Couldn't start the handoff",
					description: "Try again later.",
				});
				toast.error(message, { description });
			}
			return false;
		} finally {
			setIsMinting(false);
		}
	}, []);

	const started = useRef(false);
	useEffect(() => {
		if (started.current) return;
		started.current = true;

		showModal();
		void mint().then((ok) => {
			if (!ok) closeModal();
		});
	}, [mint, showModal, closeModal]);

	const status = trpc.handoff.status.useQuery(
		{ nonce: minted?.nonce ?? "" },
		{
			enabled: minted !== null,
			staleTime: 0,
			refetchInterval: (query) => {
				const phase = query.state.data?.phase;
				if (!minted || isTerminal(phase)) return false;

				const remainingMs =
					minted.expiresAt + HANDOFF_RESULT_GRACE_MS - Date.now();
				if (remainingMs <= 0) return false;

				const backoffMs =
					phase === "opened"
						? POLL_OPENED_MS
						: Math.min(
								POLL_CAP_MS,
								POLL_INITIAL_MS * POLL_GROWTH ** query.state.dataUpdateCount,
							);

				/**
				 * The last poll lands just past the cutoff so the server gets to say
				 * "expired".
				 */
				return Math.min(backoffMs, remainingMs + 100);
			},
		},
	);

	const phase = status.data?.phase;

	useEffect(() => {
		if (status.data?.phase !== "done") return;

		onResult(status.data.extractedText);
		toast.success("Recipe text received from your phone");
		void utils.billing.ocrQuotaState.invalidate();
		closeModal();
	}, [status.data, onResult, utils, closeModal]);

	useEffect(() => {
		const code = status.error?.data?.code;
		if (!code || !TERMINAL_ERROR_CODES.has(code)) return;

		toast.error("Handoff ended", {
			description: "The link is no longer valid. Start a new one.",
		});
		closeModal();
	}, [status.error, closeModal]);

	function handleClose() {
		if (minted && phase !== "done") {
			closeOnServer({ nonce: minted.nonce });
		}
		onClose();
	}

	async function renew() {
		if (minted) {
			closeOnServer({ nonce: minted.nonce });
		}
		await mint();
	}

	const stale = phase === "expired" || phase === "closed";

	return (
		<Alert
			ref={dialogRef}
			isOpen={isOpen}
			onClose={handleClose}
			heading="Take a photo with your phone"
			className={styles.dialog}
			actions={
				<>
					{stale ? (
						<Button
							variant="solid"
							color="accent"
							onClick={renew}
							disabled={isMinting}
						>
							New code
						</Button>
					) : null}

					<Button variant="clear" color="light" onClick={closeModal}>
						Cancel
					</Button>
				</>
			}
		>
			{minted ? (
				<Grid gap={4} justifyItems="center">
					<div className={clsx(styles.card, { [styles.stale]: stale })}>
						<svg
							viewBox={`0 0 ${minted.qr.size} ${minted.qr.size}`}
							role="img"
							aria-label="QR code that opens this handoff on your phone"
							className={styles.qr}
						>
							<title>Handoff QR code</title>
							<path d={minted.qr.path} shapeRendering="crispEdges" />
						</svg>
					</div>

					<div className={styles.status} aria-live="polite">
						<StatusLine phase={phase} />

						{status.isError && !isTerminal(phase) ? (
							<Text as="p" size={2} className={styles.hiccup}>
								Connection hiccup. Still checking.
							</Text>
						) : null}
					</div>

					<Text size={2} align="center">
						The code is valid for {TTL_MINUTES} minutes. Closing this dialog
						cancels the handoff.
					</Text>

					<CopyToClipboard
						getValue={() => minted.url}
						size="small"
						variant="outline"
						color="light"
						disabled={stale}
					>
						Copy link
					</CopyToClipboard>
				</Grid>
			) : (
				<Flex gap={2} alignItems="center" justifyContent="center">
					<Spinner size={3} />
					<Text as="span" heavy>
						Preparing your code…
					</Text>
				</Flex>
			)}
		</Alert>
	);
}
