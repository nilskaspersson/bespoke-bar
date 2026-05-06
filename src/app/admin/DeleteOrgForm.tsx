"use client";

import { useRef } from "react";
import { deleteLocalOrganisationAction } from "@/features/organisation/api/deleteLocalOrganisation";
import { Grid } from "@/ui/Grid";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export function DeleteOrgForm() {
	const formRef = useRef<HTMLFormElement>(null);

	async function action(formData: FormData) {
		const localOrgId = String(formData.get("localOrgId") ?? "");

		const promise = deleteLocalOrganisationAction({ localOrgId });

		toast.promise(promise, {
			loading: "Deleting bar…",
			success: (result) => ({
				message: result.deletedId
					? `Deleted bar ${result.deletedId}`
					: `No bar found for ${localOrgId}`,
			}),
			error: (err) => ({
				message: "Could not delete bar",
				description: err instanceof Error ? err.message : "Try again later.",
			}),
		});

		try {
			await promise;
			formRef.current?.reset();
		} catch {
			// Handled by toast.promise
		}
	}

	return (
		<form ref={formRef} action={action}>
			<Grid gap={5}>
				<TextField label="Bar ID" name="localOrgId" required />

				<div>
					<SubmitButton variant="solid" color="red">
						Delete bar
					</SubmitButton>
				</div>
			</Grid>
		</form>
	);
}
