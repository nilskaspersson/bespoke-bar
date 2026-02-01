import { Suspense } from "react";
import { TERMS_CONDITIONS_VERSION } from "@/features/consent/constants";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import styles from "./page.module.css";

/**
 * IMPORTANT: When updating these terms, also update the TERMS_CONDITIONS_VERSION
 * constant.
 */
export default async function TermsPage() {
	"use cache";

	return (
		<Container as="article" className={styles.article}>
			<Grid gap={6}>
				<Grid as="header" gap={4}>
					<HGroup
						tagline={
							<Text as="em" italic>
								Last updated:{" "}
								<Suspense>
									<Time date={new Date(TERMS_CONDITIONS_VERSION)} />
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
