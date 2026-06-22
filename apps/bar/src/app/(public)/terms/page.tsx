import { Container } from "@bespoke/ui/Container";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { Text } from "@bespoke/ui/Text";
import { Time } from "@bespoke/ui/Time";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { TERMS_CONDITIONS_VERSION } from "@/features/consent/constants";
import styles from "./page.module.css";

/**
 * IMPORTANT: When updating these terms, also update the TERMS_CONDITIONS_VERSION
 * constant.
 */
export default async function TermsPage() {
	"use cache";
	cacheLife("max");

	return (
		<Container as="article" className={styles.article}>
			<Grid gap={6}>
				<Grid as="header" gap={4}>
					<HGroup
						tagline={
							<Text as="em" italic>
								Last updated:{" "}
								<Suspense>
									<Time date={TERMS_CONDITIONS_VERSION} />
								</Suspense>
							</Text>
						}
					>
						<Heading level="h1">Terms & Conditions</Heading>
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
					<Heading level="h2">Acceptable Use</Heading>

					<Text as="p">
						Uploaded images must only contain recipes, pictures of cocktails,
						your bar, or otherwise related content you have the rights to use.
					</Text>

					<Text as="p">
						Do not upload or post illegal, harmful, inappropriate, or
						copyrighted content. Violations may result in account suspension.
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
