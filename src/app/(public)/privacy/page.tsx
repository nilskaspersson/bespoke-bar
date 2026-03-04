import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { PRIVACY_POLICY_VERSION } from "@/features/consent/constants";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import styles from "./page.module.css";

/**
 * IMPORTANT: When updating this privacy policy, also update the
 * PRIVACY_POLICY_VERSION constant.
 *
 * IMPORTANT: When updating anything related to text extraction, also update the
 * OCR_CONSENT_VERSION constant.
 */
export default async function PrivacyPage() {
	"use cache";
	cacheLife("max");

	return (
		<Container as="article" className={styles.article}>
			<Grid gap={6}>
				<Grid as="header" gap={4}>
					<HGroup
						tagline={
							<Text as="em">
								Last updated:{" "}
								<Suspense>
									<Time date={new Date(PRIVACY_POLICY_VERSION)} />
								</Suspense>
							</Text>
						}
					>
						<Heading level="h1">Privacy Policy</Heading>
					</HGroup>

					<Text as="p">
						<Text as="strong" heavy weight={700}>
							Bespoke Bar
						</Text>{" "}
						<em>("we", "us", "our")</em> is a cocktail recipe management
						platform.
					</Text>
				</Grid>

				<Grid as="section" gap={4}>
					<Heading level="h2">Third-Party Services</Heading>

					<Text as="ul" list>
						<Text as="li">
							<Text as="strong" heavy weight={700}>
								Clerk
							</Text>{" "}
							- Authentication (
							<a
								href="https://clerk.com/legal/privacy"
								target="_blank"
								rel="noopener noreferrer"
							>
								Privacy Policy
							</a>
							)
						</Text>

						<Text as="li">
							<Text as="strong" heavy weight={700}>
								Google Cloud
							</Text>{" "}
							- Image text extraction
						</Text>
					</Text>

					<Text as="p">
						Photos uploaded for text extraction are shared with{" "}
						<Text as="strong" heavy weight={700}>
							Google
						</Text>{" "}
						for processing. We do not store these images.
					</Text>

					<Text as="p">
						We do not use any third-party analytics tools. We do not sell your
						data.
					</Text>
				</Grid>

				<Grid as="section" gap={4}>
					<Heading level="h2">Your Data</Heading>

					<Text as="p">
						Contact{" "}
						<a href="mailto:privacy@bespoke-bar.app">privacy@bespoke-bar.app</a>{" "}
						for requests to access or delete your personal information.
					</Text>
				</Grid>

				<Grid as="section" gap={4}>
					<Heading level="h2">Contact</Heading>

					<Text as="p">
						<a href="mailto:hello@bespoke-bar.app">hello@bespoke-bar.app</a>
					</Text>
				</Grid>
			</Grid>
		</Container>
	);
}
