"use client";

import { type Menu, menuFormSchema } from "@bespoke/schema/schema/menus";
import { toast } from "@bespoke/ui/Toast";
import {
	FormProvider,
	type SubmissionResult,
	useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createMenu } from "@/features/menus/api/createMenu";
import { MenuFormFields } from "@/features/menus/components/MenuFormFields";
import {
	menuEditorStore,
	useMenuEditor,
} from "@/features/menus/stores/menuEditor";
import { getMenuUrl } from "@/features/menus/utils";
import { useInvalidateClientCache } from "@/hooks/useInvalidateClientCache";
import { getErrorToast } from "@/utils/api";

export function CreateMenuDrawerForm({ formId }: { formId: string }) {
	const router = useRouter();
	const setPending = useMenuEditor((s) => s.setPending);
	const invalidateClientCache = useInvalidateClientCache();
	const formRef = useRef<HTMLFormElement>(null);
	const [submitting, setSubmitting] = useState(false);
	const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

	const [form, fields] = useForm({
		id: formId,
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: menuFormSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		async onSubmit(event, { formData }) {
			event.preventDefault();

			if (submitting) {
				return;
			}

			const submission = parseWithZod(formData, { schema: menuFormSchema });

			if (submission.status !== "success") {
				setLastResult(submission.reply());
				return;
			}

			setSubmitting(true);
			setPending(true);

			let menu: Menu;

			try {
				menu = await createMenu(submission.value);
			} catch (error) {
				const { message, description } = getErrorToast(error, {
					message: "Could not create menu.",
					description: "Try again later.",
				});
				toast.error(message, { description });
				return;
			} finally {
				setSubmitting(false);
				setPending(false);
			}

			toast.success(`Created menu ${menu.name}`);
			invalidateClientCache("menu.create");
			menuEditorStore.dialogRef.current?.close();
			router.push(getMenuUrl(menu));
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
