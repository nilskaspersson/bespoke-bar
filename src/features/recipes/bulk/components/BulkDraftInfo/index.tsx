import type { ComponentProps } from "react";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";

export function BulkDraftInfo(props: ComponentProps<typeof Grid>) {
	return (
		<Grid gap={2} {...props}>
			<Callout color="light" icon="circle-info" size={2}>
				<Text as="ul" list>
					<li>Most common units and aliases are supported.</li>
					<li>New ingredients are created automatically.</li>
					<li>Existing ingredients are matched by name.</li>
					<li>
						Create many recipes by separating each recipe with a blank line.
					</li>
				</Text>
			</Callout>
		</Grid>
	);
}
