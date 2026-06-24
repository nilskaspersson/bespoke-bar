"use client";

import type { AdminOrgSummary } from "@bespoke/api/admin/listOrganisationsForAdmin";
import type { OrgMemberSummary } from "@bespoke/api/admin/listOrgMembers";
import { Chip } from "@bespoke/ui/Chip";
import { Combobox } from "@bespoke/ui/Combobox";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { parseAsString, useQueryState } from "nuqs";
import { grantOCRQuotaManual } from "@/features/billing/api/grantOCRQuotaManual";
import { grantSlotsManual } from "@/features/billing/api/grantSlotsManual";
import { UsageCard } from "@/features/billing/components/UsageCard";
import { trpc } from "@/trpc/client";
import { AssignProForm } from "./AssignProForm";
import { DeleteOrgForm } from "./DeleteOrgForm";
import { GrantQuotaForm } from "./GrantQuotaForm";
import styles from "./page.module.css";

/** Stable across renders — the Combobox rebuilds its item index from these. */
const getOrgValue = (org: AdminOrgSummary) => org.id;
const orgToString = (org: AdminOrgSummary | null) => org?.name ?? "";

type Props = {
	currentOrgId: string | undefined;
};

export function AdminConsole({ currentOrgId }: Props) {
	const [orgParam, setOrgParam] = useQueryState(
		"org",
		parseAsString.withOptions({ history: "replace", scroll: false }),
	);
	const utils = trpc.useUtils();

	const { data: orgs = [], isLoading } = trpc.admin.organisations.useQuery();

	/** A known org id, or null — never invent a selection from a stale/unknown
	 * param. The current org is the default since it's a known id. */
	const knownId = (id: string | null | undefined): string | null =>
		id && orgs.some((org) => org.id === id) ? id : null;
	const selectedId = knownId(orgParam) ?? knownId(currentOrgId);
	const selectedOrg = orgs.find((org) => org.id === selectedId);

	const { data: details } = trpc.admin.orgDetails.useQuery(
		{ orgId: selectedId ?? "" },
		{ enabled: selectedId !== null },
	);

	function selectOrg(id: string) {
		if (id !== selectedId) {
			setOrgParam(id);
		}
	}

	function reload() {
		if (selectedId) {
			utils.admin.orgDetails.invalidate({ orgId: selectedId });
		}
	}

	function handleDeleted() {
		utils.admin.organisations.invalidate();
		setOrgParam(null);
	}

	return (
		<Grid gap={6}>
			<div className={styles.picker}>
				<Combobox<AdminOrgSummary>
					label="Organisation"
					name="orgId"
					items={orgs}
					itemToString={orgToString}
					getItemValue={getOrgValue}
					value={selectedId ?? ""}
					comboboxProps={{
						onSelectedItemChange: ({ selectedItem }) => {
							if (selectedItem) {
								selectOrg(selectedItem.id);
							}
						},
					}}
					inputProps={{ fullWidth: true }}
				/>

				{selectedOrg ? (
					<Flex gap={2} alignItems="center" wrap>
						<Text size={1} light numeric compact>
							Internal org id: {selectedOrg.id}
						</Text>

						<Text size={1} light truncate compact>
							Clerk org id: {selectedOrg.clerkOrgId}
						</Text>

						{selectedOrg.isOrphaned ? (
							<Chip color="amber" variant="outline" size={1}>
								Orphaned
							</Chip>
						) : null}
					</Flex>
				) : null}
			</div>

			{selectedOrg ? (
				<>
					<Grid as="section" gap={4}>
						<Heading level="h2" size={4}>
							Usage
						</Heading>
						<div className={styles.usage}>
							<UsageCard
								icon="camera"
								label="Photo-to-Recipe"
								overline="Scans this month"
								used={details?.ocrQuota.used}
								limit={details?.ocrQuota.limit}
							/>
							<UsageCard
								icon="duotone-martini-glass"
								label="Recipe slots"
								overline="Used slots"
								used={details?.slots.used}
								limit={details?.slots.limit}
							/>
						</div>
					</Grid>

					<Flex wrap gap={5} alignItems="flex-start">
						<Grid as="section" gap={3} className={styles.section}>
							<Heading level="h2" size={4}>
								Members
							</Heading>

							<MembersList members={details?.members} />
						</Grid>

						<Grid as="section" gap={3} className={styles.section}>
							<Heading level="h2" size={4}>
								Pro subscription
							</Heading>

							<AssignProForm
								orgId={selectedOrg.id}
								subscription={details?.subscription}
								onSuccess={reload}
							/>
						</Grid>

						<Grid as="section" gap={3} className={styles.section}>
							<Heading level="h2" size={4}>
								Grant recipe slots
							</Heading>
							<GrantQuotaForm
								orgId={selectedOrg.id}
								action={grantSlotsManual}
								unit="slot"
								min={-10000}
								max={10000}
								onSuccess={reload}
							/>
						</Grid>

						<Grid as="section" gap={3} className={styles.section}>
							<Heading level="h2" size={4}>
								Grant OCR quota
							</Heading>
							<GrantQuotaForm
								orgId={selectedOrg.id}
								action={grantOCRQuotaManual}
								unit="use"
								min={-1000}
								max={1000}
								onSuccess={reload}
							/>
						</Grid>

						{selectedOrg.isOrphaned ? (
							<Grid as="section" gap={3} className={styles.section}>
								<Heading level="h2" size={4}>
									Delete bar
								</Heading>
								<DeleteOrgForm
									orgId={selectedOrg.id}
									onSuccess={handleDeleted}
								/>
							</Grid>
						) : null}
					</Flex>
				</>
			) : (
				<Text light>
					{isLoading
						? "Loading organisations…"
						: "Select an organisation to manage."}
				</Text>
			)}
		</Grid>
	);
}

function MembersList({ members }: { members: OrgMemberSummary[] | undefined }) {
	if (!members) {
		return <Skeleton width="14ch" />;
	}

	if (!members.length) {
		return (
			<Text size={3} light>
				No members.
			</Text>
		);
	}

	return (
		<Grid as="ul" gap={2}>
			{members.map((member) => (
				<Text as="li" key={member.userId} size={3}>
					{member.name}
				</Text>
			))}
		</Grid>
	);
}
