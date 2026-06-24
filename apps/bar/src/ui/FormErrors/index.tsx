import { Button } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { Text } from "@bespoke/ui/Text";
import { useFormMetadata } from "@conform-to/react";
import type { RefObject } from "react";
import { focusFieldByName } from "@/utils/form";

export function FormErrors({
	formRef,
}: {
	formRef: RefObject<HTMLFormElement | null>;
}) {
	const form = useFormMetadata();

	const errorEntries = Object.entries(form.allErrors);

	if (errorEntries.length === 0) {
		return null;
	}

	return (
		<Callout color="red" size={2} heading="Issues">
			<Text list as="ul">
				{errorEntries.map(([field, error]) => (
					<li key={field}>
						<Button
							variant="base"
							onClick={() => {
								focusFieldByName(formRef.current, field);
							}}
						>
							{error}
						</Button>
					</li>
				))}
			</Text>
		</Callout>
	);
}
