"use client";

import { type Menu, menuFormSchema } from "@bespoke/schema/schema/menus";
import { toast } from "@bespoke/ui/Toast";
import {
	FormProvider,
	type SubmissionResult,
	useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRef, useState } from "react";
import { updateMenuAction } from "@/features/menus/api/updateMenu";
import { MenuFormFields } from "@/features/menus/components/MenuFormFields";
import {
	menuEditorStore,
	useMenuEditor,
} from "@/features/menus/stores/menuEditor";
import { useInvalidateClientCache } from "@/hooks/useInvalidateClientCache";

export function EditMenuForm({
	formId,
	menu,
}: {
	formId: string;
	menu: Partial<Menu>;
}) {
	const setPending = useMenuEditor((s) => s.setPending);
	const invalidateClientCache = useInvalidateClientCache();
	const formRef = useRef<HTMLFormElement>(null);
	const [submitting, setSubmitting] = useState(false);
	const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

	const [form, fields] = useForm({
		id: formId,
		lastResult,
		defaultValue: {
			name: menu.name,
			description: menu.description,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: menuFormSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		async onSubmit(event, { formData }) {
			event.preventDefault();

			if (!menu.id || submitting) {
				return;
			}

			setSubmitting(true);
			setPending(true);

			const result = await updateMenuAction(menu.id, formData);

			setSubmitting(false);
			setPending(false);
			setLastResult(result);

			if (result.status === "error") {
				const messages = Object.values(result.error ?? {})
					.flat()
					.filter(Boolean) as string[];

				toast.error(
					messages.length > 0 ? (
						<ul>
							{messages.map((message) => (
								<li key={message}>{message}</li>
							))}
						</ul>
					) : (
						"Could not update menu."
					),
				);

				return;
			}

			toast.success(`Updated menu ${formData.get("name") ?? menu.name}`);
			invalidateClientCache("menu.update");
			menuEditorStore.dialogRef.current?.close();
		},
	});

	return (
		<FormProvider context={form.context}>
			<form
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				autoComplete="off"
				noValidate
			>
				<MenuFormFields fields={fields} formRef={formRef} />
			</form>
		</FormProvider>
	);
}
