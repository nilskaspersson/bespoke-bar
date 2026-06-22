"use client";

import { Button } from "@bespoke/ui/Button";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import type { IconName } from "@bespoke/ui/icons/types";
import { Text } from "@bespoke/ui/Text";
import { useClerk } from "@clerk/nextjs";
import { Suspense, use, useEffect, useState } from "react";
import { BillingPortalButton } from "@/features/billing/components/BillingPortalButton";
import { OrganisationLocaleSettings } from "@/features/organisation/components/OrganisationLocaleSettings";
import { TagsSettings } from "@/features/tags/components/TagsSettings";
import styles from "./styles.module.css";

type Section = {
	id: string;
	icon: IconName;
	label: string;
	description: string;
	Content: () => React.ReactNode;
};

type AccountItem = {
	startPath: string;
	icon: IconName;
	label: string;
	description: string;
};

const SECTIONS: readonly Section[] = [
	{
		id: "locale",
		icon: "globe",
		label: "Locale & Currency",
		description: "Currency, date, and number formatting.",
		Content: OrganisationLocaleSettings,
	},
	{
		id: "tags",
		icon: "tags",
		label: "Recipe tags",
		description: "Rename and organise your recipe tags.",
		Content: TagsSettings,
	},
];

const ACCOUNT: readonly AccountItem[] = [
	{
		startPath: "/",
		icon: "building",
		label: "General",
		description: "Organisation name and profile.",
	},
	{
		startPath: "/organization-members",
		icon: "users",
		label: "Members",
		description: "Invite and manage your team.",
	},
];

const SECTION_IDS = new Set(SECTIONS.map((section) => section.id));

export function SettingsNav({
	hasBillingPromise,
}: {
	hasBillingPromise: Promise<boolean>;
}) {
	const { openOrganizationProfile } = useClerk();
	const [openId, setOpenId] = useState<string | null>(null);

	useEffect(() => {
		function openFromHash() {
			const id = window.location.hash.slice(1);
			if (SECTION_IDS.has(id)) {
				setOpenId(id);
			}
		}

		openFromHash();
		window.addEventListener("hashchange", openFromHash);
		return () => window.removeEventListener("hashchange", openFromHash);
	}, []);

	return (
		<nav className={styles.nav} aria-label="Organisation settings">
			<ul className={styles.list}>
				{SECTIONS.map((entry) => {
					const isOpen = openId === entry.id;

					return (
						<li key={entry.id} className={styles.item}>
							<Button
								variant="base"
								className={styles.row}
								id={`settings-row-${entry.id}`}
								aria-expanded={isOpen}
								aria-controls={`settings-panel-${entry.id}`}
								onClick={() =>
									setOpenId((current) =>
										current === entry.id ? null : entry.id,
									)
								}
								startAdornment={
									<Icon name={entry.icon} size={5} className={styles.icon} />
								}
								endAdornment={
									<Icon
										name="angle-right"
										size={3}
										className={styles.chevron}
									/>
								}
							>
								<RowText label={entry.label} description={entry.description} />
							</Button>

							{isOpen ? (
								<section
									id={`settings-panel-${entry.id}`}
									aria-labelledby={`settings-row-${entry.id}`}
									className={styles.panel}
								>
									<entry.Content />
								</section>
							) : null}
						</li>
					);
				})}

				<li className={styles.item}>
					<Suspense fallback={<BillingRowButton disabled />}>
						<BillingRow hasBillingPromise={hasBillingPromise} />
					</Suspense>
				</li>

				{ACCOUNT.map((item) => (
					<li key={item.startPath} className={styles.item}>
						<Button
							variant="base"
							className={styles.row}
							aria-haspopup="dialog"
							onClick={() =>
								openOrganizationProfile({
									__experimental_startPath: item.startPath,
								})
							}
							startAdornment={
								<Icon name={item.icon} size={5} className={styles.icon} />
							}
							endAdornment={
								<Icon name="expand" size={2} className={styles.glyph} />
							}
						>
							<RowText label={item.label} description={item.description} />
						</Button>
					</li>
				))}
			</ul>
		</nav>
	);
}

function RowText({
	label,
	description,
}: {
	label: string;
	description: string;
}) {
	return (
		<Grid gap={0}>
			<Text as="div" size={2} weight={600} heavy compact>
				{label}
			</Text>

			<Text as="p" size={1} light>
				{description}
			</Text>
		</Grid>
	);
}

function BillingRow({
	hasBillingPromise,
}: {
	hasBillingPromise: Promise<boolean>;
}) {
	const hasBilling = use(hasBillingPromise);
	return <BillingRowButton disabled={!hasBilling} />;
}

function BillingRowButton({ disabled }: { disabled?: boolean }) {
	return (
		<BillingPortalButton
			variant="base"
			disabled={disabled}
			className={styles.row}
			startAdornment={
				<Icon name="duotone-shop" size={5} className={styles.icon} />
			}
			endAdornment={
				<Icon name="external-link" size={2} className={styles.glyph} />
			}
		>
			<RowText
				label="Billing"
				description="Manage your subscription, payment methods, find invoices, and more."
			/>
		</BillingPortalButton>
	);
}
