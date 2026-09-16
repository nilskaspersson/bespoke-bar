"use client";

import type {
	HandoffPhase,
	MintedHandoff,
} from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { Button } from "@bespoke/ui/Button";
import { CopyToClipboard } from "@bespoke/ui/CopyToClipboard";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { Panel } from "@bespoke/ui/Panel";
import { Spinner } from "@bespoke/ui/Spinner";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import { useHandoffResult } from "@/features/recipes/photo/hooks/useHandoffResult";
import { trpc } from "@/trpc/client";
import { HandoffSkeleton } from "./skeleton";
import styles from "./styles.module.css";

const POLL_MS = 3_000;

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

function isTerminalError(
	error: { data?: { code?: string } | null } | null | undefined,
) {
	const code = error?.data?.code;
	return code !== undefined && TERMINAL_ERROR_CODES.has(code);
}

export function HandoffContent({
	link,
	isMinting,
	onRenew,
	onResult,
}: {
	link: MintedHandoff | null;
	isMinting: boolean;
	onRenew: () => void;
	onResult: (extractedText: string) => void;
}) {
	const status = trpc.handoff.status.useQuery(
		{ nonce: link?.nonce ?? "" },
		{
			enabled: link !== null,
			staleTime: 0,
			retry: (failureCount, error) =>
				!isTerminalError(error) && failureCount < 3,
			refetchInterval: (query) =>
				isTerminal(query.state.data?.phase) ||
				isTerminalError(query.state.error)
					? false
					: POLL_MS,
		},
	);

	useHandoffResult(status.data, onResult);

	if (!link) {
		return <HandoffSkeleton />;
	}

	const phase = status.data?.phase;
	const isStale =
		phase === "lapsed" ||
		phase === "expired" ||
		phase === "closed" ||
		isTerminalError(status.error);

	return (
		<Panel
			footer={
				<div className={styles.status} aria-live="polite">
					<Text as="p" heavy align="center">
						{isStale ? "The handoff has expired." : "Scan to start handoff."}
					</Text>

					{status.isError && !isStale ? (
						<Text as="p" size={2} className={styles.hiccup}>
							Connection hiccup. Still checking.
						</Text>
					) : null}
				</div>
			}
		>
			<Grid gap={4} justifyItems="center">
				<div className={styles.card}>
					<svg
						viewBox={`0 0 ${link.qr.size} ${link.qr.size}`}
						role="img"
						aria-label="QR code that opens this handoff on another device"
						className={clsx(styles.qr, { [styles.stale]: isStale })}
					>
						<title>Handoff QR code</title>
						<path d={link.qr.path} shapeRendering="crispEdges" />
					</svg>

					{isStale ? (
						<div className={styles.overlay}>
							<Button
								variant="solid"
								color="amber"
								onClick={onRenew}
								disabled={isMinting}
								icon
							>
								{isMinting ? (
									<Spinner size={3} />
								) : (
									<Icon name="arrow-rotate-right" />
								)}
							</Button>
						</div>
					) : (
						<CopyToClipboard
							icon
							size="tiny"
							aria-label="Copy link"
							title="Copy link"
							getValue={() => link.url}
							className={styles.copy}
						/>
					)}
				</div>
			</Grid>
		</Panel>
	);
}
