import { userInputToBulkRecipe } from "@bespoke/domain/ingredientLines/userInputToBulkRecipe";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Panel } from "@bespoke/ui/Panel";
import { Text } from "@bespoke/ui/Text";
import Image from "next/image";
import { PhotoToRecipeDemo } from "@/features/landing-page/components/PhotoToRecipeDemo";
import styles from "./styles.module.css";

const BLOB_BASE_URL = process.env.NEXT_PUBLIC_BLOB_BASE_URL ?? "";

const INITIAL_TEXT = "Gimlet\n5 cl Gin\n3 cl Lime juice\n2 cl Simple syrup";

export function PhotoToRecipeSection() {
	return (
		<section className={styles.band}>
			<Grid as="header" gap={3} className={styles.header}>
				<Heading level="h2" size={7} align="center">
					Start with what you already have.
				</Heading>

				<Text as="p" size={3} balance align="center">
					Take a photo of your notebook, copy specs from your digital notes, or
					upload a screenshot of a recipe. Bespoke Bar structures it as a
					scaleable recipe.
				</Text>
			</Grid>

			<div className={styles.demo}>
				<PhotoToRecipeDemo
					initialText={INITIAL_TEXT}
					initialRecipe={userInputToBulkRecipe(INITIAL_TEXT, [])[0]}
					photo={
						<Panel
							className={styles.panel}
							header={
								<Flex gap={2} alignItems="center">
									<Icon name="camera" size={3} className={styles.panelIcon} />

									<Text size={1} weight={600}>
										1. Photo
									</Text>
								</Flex>
							}
							box={
								<Image
									src={`${BLOB_BASE_URL}/static/gimlet.jpg`}
									alt="A paper napkin with a handwritten Gimlet spec: 5 cl gin, 3 cl lime juice, 2 cl simple syrup"
									width={150}
									height={200}
									className={styles.photo}
								/>
							}
						/>
					}
				/>
			</div>
		</section>
	);
}
