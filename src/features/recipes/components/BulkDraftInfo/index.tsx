import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";

export function BulkDraftInfo({ className }: { className?: string }) {
	return (
		<Grid gap={2} className={className}>
			<Callout
				color="heavy"
				heading="Type any number of recipes in the following format."
				icon="circle-question"
			>
				<Text as="div" italic>
					Gimlet
					<br />5 cl gin
					<br />
					30 ml lime juice
					<br />
					2.5 centiliters simple syrup
					<br />
					<br />
					Daiquiri
					<br />2 ounces rum
					<br />1 ounce lime juice
					<br />
					3/4 fl-oz demerara syrup
				</Text>
			</Callout>

			<Callout color="light" icon="circle-info" size={2}>
				Most common units and aliases are supported. New ingredients are created
				automatically. Existing ingredients are matched by name.
			</Callout>
		</Grid>
	);
}
