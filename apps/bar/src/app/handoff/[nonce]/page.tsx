import { inspectHandoff } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HandoffCapture } from "@/features/recipes/photo/components/HandoffCapture";
import { HandoffEnded } from "@/features/recipes/photo/components/HandoffEnded";
import styles from "./page.module.css";

type Params = Promise<{ nonce: string }>;

export default function HandoffPage({ params }: { params: Params }) {
	return (
		<section className={styles.base}>
			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="40lvh" />
					</SkeletonScreen>
				}
			>
				<HandoffGate params={params} />
			</Suspense>
		</section>
	);
}

/**
 * Only reads here. Marking the handoff as opened happens client-side, otherwise
 * link previews would count as a scan.
 */
async function HandoffGate({ params }: { params: Params }) {
	const { nonce } = await params;
	const inspected = await inspectHandoff(nonce);

	return inspected.ok ? (
		<HandoffCapture nonce={nonce} />
	) : (
		<HandoffEnded reason={inspected.reason} />
	);
}

/** The URL is the credential, don't leak it through the referrer. */
export const metadata: Metadata = {
	title: "Hand off a photo",
	referrer: "no-referrer",
};
