import { formatLine } from "@bespoke/domain/ingredientLines/formatLine";
import { MOCK_INGREDIENTS } from "@bespoke/domain/mocks/ingredients";
import { collator } from "@bespoke/domain/utils/collator";
import {
	createCurrencyDisplayName,
	createCurrencyFormatter,
	createDateTimeFormatter,
	createPercentageFormatter,
	createRelativeTimeFormatter,
} from "@bespoke/domain/utils/formatting";
import { selectIngredientSchema } from "@bespoke/schema/schema/ingredients";
import { nanoid } from "nanoid";
import { ScrollView, Text } from "react-native";

function Row({ label, run }: { label: string; run: () => string }) {
	try {
		return (
			<Text>
				{label}: {run()}
			</Text>
		);
	} catch (error) {
		return (
			<Text style={{ color: "red" }}>
				{label}: {String(error)}
			</Text>
		);
	}
}

export default function ToolchainProof() {
	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<Row
				label="domain formatLine"
				run={() =>
					formatLine({
						quantity: 4,
						unit: "cl",
						name: MOCK_INGREDIENTS[0].name,
					})
				}
			/>
			<Row
				label="schema safeParse"
				run={() =>
					String(selectIngredientSchema.safeParse(MOCK_INGREDIENTS[0]).success)
				}
			/>
			<Row
				label="crypto.getRandomValues"
				run={() => typeof globalThis.crypto?.getRandomValues}
			/>
			<Row label="nanoid(10)" run={() => nanoid(10)} />
			<Row
				label="Intl.NumberFormat currency"
				run={() => createCurrencyFormatter("en-GB", "USD").format(12.5)}
			/>
			<Row
				label="Intl.NumberFormat percent"
				run={() => createPercentageFormatter("en-GB").format(0.4)}
			/>
			<Row
				label="Intl.DateTimeFormat"
				run={() => createDateTimeFormatter("en-GB").format(new Date())}
			/>
			<Row
				label="Intl.Collator"
				run={() => String(collator.compare("Añejo", "Aperol"))}
			/>
			<Row
				label="Intl.RelativeTimeFormat"
				run={() => createRelativeTimeFormatter("en-GB").format(-2, "day")}
			/>
			<Row
				label="Intl.DisplayNames"
				run={() => String(createCurrencyDisplayName("en-GB").of("USD"))}
			/>
		</ScrollView>
	);
}
