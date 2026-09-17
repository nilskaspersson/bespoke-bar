import type { HandoffEndedReason } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";

const COPY: Record<HandoffEndedReason, { heading: string; body: string }> = {
	expired: {
		heading: "This link has expired",
		body: "Start a new handoff on your desktop and scan the fresh code.",
	},
	closed: {
		heading: "This handoff has ended",
		body: "Either the photo already went through, or the desktop closed it. Start a new handoff there if you need another.",
	},
};

export function HandoffEnded({ reason }: { reason: HandoffEndedReason }) {
	const { heading, body } = COPY[reason];

	return (
		<Grid gap={3} justifyItems="center">
			<Icon name="circle-xmark" size={7} />

			<Heading level="h1" size={5} align="center">
				{heading}
			</Heading>

			<Text as="p" align="center" heavy>
				{body}
			</Text>
		</Grid>
	);
}
