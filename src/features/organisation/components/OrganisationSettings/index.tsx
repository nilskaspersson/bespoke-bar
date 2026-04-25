import { useForm } from "@conform-to/react";
import { useCallback } from "react";
import type { Organisation } from "@/db/schema/organisations";
import { updateLocalOrganisationAction } from "@/features/organisation/api/updateLocalOrganisation";
import { SelectCurrency } from "@/features/organisation/components/SelectCurrency";
import { SelectLocale } from "@/features/organisation/components/SelectLocale";
import { trpc } from "@/trpc/client";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { SkeletonScreen } from "@/ui/Skeleton";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextFieldSkeleton } from "@/ui/TextField";
import { toast } from "@/ui/Toast";
import styles from "./styles.module.css";

export function OrganisationSettings() {
	const { data: organisation, isLoading } = trpc.organisation.get.useQuery();

	return (
		<article>
			<Heading level="h1" className={styles.heading}>
				Settings
			</Heading>

			{organisation ? (
				<OrganisationSettingsForm organisation={organisation} />
			) : isLoading ? (
				<OrganisationSettingsSkeleton />
			) : null}
		</article>
	);
}

function OrganisationSettingsForm({
	organisation,
}: {
	organisation: Organisation;
}) {
	const [form, fields] = useForm({
		id: "organization-settings-form",
		defaultValue: {
			currency: organisation.currency,
			defaultLocale: organisation.defaultLocale,
		},
	});

	const utils = trpc.useUtils();

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			const promise = updateLocalOrganisationAction(formData);

			toast.promise(promise, {
				id: toastId,
				loading: "Updating organisation settings…",
				success: () => ({
					message: "Organisation settings updated",
				}),
				error: () => ({
					message: "Could not update organisation settings",
					description: "Try again later.",
				}),
			});

			await promise;
			utils.organisation.get.invalidate();
		},
		[utils],
	);

	return (
		<Grid
			as="form"
			gap={6}
			action={handleSubmit}
			onSubmit={form.onSubmit}
			id={form.id}
		>
			<SelectCurrency
				name={fields.currency.name}
				label="Currency"
				helperText="The currency used for cost and price in the app."
				defaultValue={fields.currency.defaultValue}
			/>

			<Grid gap={2}>
				<SelectLocale
					name={fields.defaultLocale.name}
					label="Locale formatting"
					helperText="Used to format currency, dates, numbers, and more."
					defaultValue={fields.defaultLocale.defaultValue}
				/>

				<Callout size={1} color="accent" heading="Note:">
					This does <strong>not</strong> change the language of the app.
				</Callout>
			</Grid>

			<div>
				<SubmitButton
					form={form.id}
					variant="solid"
					color="accent"
					size="small"
				>
					Apply changes
				</SubmitButton>
			</div>
		</Grid>
	);
}

function OrganisationSettingsSkeleton() {
	return (
		<SkeletonScreen>
			<Grid gap={6}>
				<TextFieldSkeleton />
				<TextFieldSkeleton />
			</Grid>
		</SkeletonScreen>
	);
}
