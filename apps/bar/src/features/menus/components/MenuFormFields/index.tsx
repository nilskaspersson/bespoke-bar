"use client";

import { Grid } from "@bespoke/ui/Grid";
import { TextField } from "@bespoke/ui/TextField";
import type { FieldMetadata } from "@conform-to/react";
import type { RefObject } from "react";
import { FormErrors } from "@/ui/FormErrors";

type MenuFieldName = "id" | "name" | "description" | "isPublic";

export function MenuFormFields({
	fields,
	formRef,
}: {
	fields: Record<MenuFieldName, FieldMetadata<unknown>>;
	formRef: RefObject<HTMLFormElement | null>;
}) {
	return (
		<Grid gap={5}>
			<TextField
				label="Name"
				name={fields.name.name}
				id={fields.name.id}
				defaultValue={fields.name.defaultValue}
				required
			/>

			<TextField
				as="textarea"
				label="Description"
				name={fields.description.name}
				id={fields.description.id}
				defaultValue={fields.description.defaultValue}
				rows={3}
			/>

			<FormErrors formRef={formRef} />
		</Grid>
	);
}
