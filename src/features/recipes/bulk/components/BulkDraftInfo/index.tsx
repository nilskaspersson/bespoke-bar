import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";

export function BulkDraftInfo({ className }: { className?: string }) {
	return (
		<Grid gap={2} className={className}>
			<Callout color="light" icon="circle-info" size={2}>
				Most common units and aliases are supported. New ingredients are created
				automatically. Existing ingredients are matched by name. Create many
				recipes by separating each recipe with a blank line.
			</Callout>
		</Grid>
	);
}
