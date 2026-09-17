"use client";

import { Grid } from "@bespoke/ui/Grid";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { Text } from "@bespoke/ui/Text";
import { deleteLocalOrganisationAction } from "@/features/organisation/api/deleteLocalOrganisation";
import { createPromiseToast } from "@/utils/createPromiseToast";

type Props = {
	orgId: string;
	onSuccess?: () => void;
};

export function DeleteOrgForm({ orgId, onSuccess }: Props) {
	async function action() {
		const promise = deleteLocalOrganisationAction({ localOrgId: orgId });

		await createPromiseToast(promise, {
			loading: "Deleting bar…",
			success: (result) => ({
				message: result.deletedId
					? `Deleted bar ${result.deletedId}`
					: "No bar found",
			}),
			error: {
				message: "Could not delete bar",
				description: "Try again later.",
			},
			onSuccess,
		});
	}

	return (
		<form action={action}>
			<Grid gap={5}>
				<Text size={2} light>
					This bar is orphaned — its Clerk organisation is gone. Removing it
					deletes all local data for the org.
				</Text>

				<div>
					<SubmitButton variant="solid" color="red">
						Delete bar
					</SubmitButton>
				</div>
			</Grid>
		</form>
	);
}
