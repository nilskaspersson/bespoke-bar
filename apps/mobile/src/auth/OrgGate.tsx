import { useOrganizationList } from "@clerk/expo";
import { useEffect } from "react";
import { AuthSplash } from "./AuthSplash";
import { SetupWall } from "./SetupWall";

/**
 * Resolves the `isSignedIn && !orgId` window (ADR-0011). Exactly one membership
 * is chosen deliberately via `setActive` — that named org becomes the JWT org
 * claim, i.e. the "explicit org_id" every request carries. Once it lands, the
 * parent gate re-renders past this branch to the app. Zero (or, defensively,
 * more than one) memberships is a decision the client must not make implicitly,
 * so it hands off to the web-setup wall. Never flash the wall while loading.
 */
export function OrgGate() {
	const { isLoaded, userMemberships, setActive } = useOrganizationList({
		userMemberships: true,
	});

	const memberships = userMemberships?.data ?? [];
	const soleOrgId =
		memberships.length === 1 ? memberships[0].organization.id : null;

	useEffect(() => {
		if (soleOrgId && setActive) {
			void setActive({ organization: soleOrgId });
		}
	}, [soleOrgId, setActive]);

	if (!isLoaded || userMemberships?.isLoading || soleOrgId) {
		return <AuthSplash />;
	}

	return <SetupWall />;
}
