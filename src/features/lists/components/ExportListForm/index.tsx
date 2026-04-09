"use client";

import { type FormEvent, use, useCallback, useMemo, useState } from "react";
import type { RecipeList } from "@/db/schema/recipeLists";
import {
	type ExportOptions,
	exportRecipeListAsJson,
	exportRecipeListAsText,
	getExportFilename,
} from "@/features/lists/utils/exportRecipeList";
import { FormatterContext } from "@/hooks/useFormatter";
import { trpc } from "@/trpc/client";
import { Checkbox } from "@/ui/Checkbox";
import { CopyToClipboard } from "@/ui/CopyToClipboard";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { RadioGroup, type RadioGroupOption } from "@/ui/RadioGroup";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import { downloadBlob } from "@/utils/downloadBlob";
import { handleKey } from "@/utils/keyboard";
import type { Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

type ExportFormat = "txt" | "json";

const DEFAULT_OPTIONS: ExportOptions = {
	includeListName: true,
	includeListDescription: true,
	includeName: true,
	includeDescription: true,
	includePrice: true,
	includeIngredients: true,
	includeSpecs: false,
	includeGlassware: false,
	includeMethod: false,
	includeGarnish: false,
	includeInstructions: false,
};

const FORMAT_OPTIONS: Keyed<RadioGroupOption>[] = [
	{ id: "txt", label: "Text", value: "txt" },
	{ id: "json", label: "JSON", value: "json" },
];

const isValidFormatOption = (option: unknown): option is ExportFormat => {
	return FORMAT_OPTIONS.some((o) => o.value === option);
};

export function ExportListForm({
	list,
	formRef,
}: {
	list: Pick<RecipeList, "id">;
	formRef?: React.RefObject<HTMLFormElement | null>;
}) {
	const [format, setFormat] = useState<ExportFormat>("txt");
	const [options, setOptions] = useState<ExportOptions>(DEFAULT_OPTIONS);

	const { currencyFormatter } = use(FormatterContext);

	const { data, isLoading } = trpc.recipeList.byId.useQuery({ id: list.id });

	const preview = useMemo(() => {
		if (!data) return "";

		switch (format) {
			case "json":
				return JSON.stringify(exportRecipeListAsJson(data, options), null, 2);
			case "txt":
				return exportRecipeListAsText(data, options, currencyFormatter);
			default:
				return "";
		}
	}, [data, format, options, currencyFormatter]);

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!data) return;

			downloadBlob({
				content: preview,
				filename: getExportFilename(data, format),
				mimeType: format === "json" ? "application/json" : "text/plain",
			});
		},
		[data, preview, format],
	);

	const toggleOption = (key: keyof ExportOptions) => {
		setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			onKeyDown={handleKey([["Enter", undefined]])}
			className={styles.container}
		>
			<Grid gap={4} className={styles.options}>
				<Heading level="h5" className={styles.optionsHeader}>
					Options
				</Heading>

				<fieldset>
					<Grid gap={2}>
						<Text size={2} as="legend" weight={600} compact>
							List details
						</Text>

						<div className={styles.checkboxes}>
							<Checkbox
								label="Name"
								checked={options.includeListName}
								onChange={() => toggleOption("includeListName")}
							/>

							<Checkbox
								label="Description"
								checked={options.includeListDescription}
								onChange={() => toggleOption("includeListDescription")}
							/>

							<Checkbox
								label="Recipe price"
								checked={options.includePrice}
								onChange={() => toggleOption("includePrice")}
							/>
						</div>
					</Grid>
				</fieldset>

				<fieldset>
					<Grid gap={2} alignContent="start">
						<Text size={2} as="legend" weight={600} compact>
							Recipe details
						</Text>

						<div className={styles.checkboxes}>
							<Checkbox
								label="Name"
								checked={options.includeName}
								onChange={() => toggleOption("includeName")}
							/>

							<Checkbox
								label="Description"
								checked={options.includeDescription}
								onChange={() => toggleOption("includeDescription")}
							/>

							<Checkbox
								label="Ingredients"
								checked={options.includeIngredients}
								onChange={() => toggleOption("includeIngredients")}
							/>
						</div>
					</Grid>
				</fieldset>

				<fieldset>
					<Grid gap={2} alignContent="start">
						<Text size={2} as="legend" weight={600} compact>
							Instructions
						</Text>

						<div className={styles.checkboxes}>
							<Checkbox
								label="Specs"
								checked={options.includeSpecs}
								onChange={() => toggleOption("includeSpecs")}
								disabled={!options.includeIngredients}
							/>

							<Checkbox
								label="Instructions"
								checked={options.includeInstructions}
								onChange={() => toggleOption("includeInstructions")}
							/>

							<Checkbox
								label="Method"
								checked={options.includeMethod}
								onChange={() => toggleOption("includeMethod")}
							/>

							<Checkbox
								label="Garnish"
								checked={options.includeGarnish}
								onChange={() => toggleOption("includeGarnish")}
							/>

							<Checkbox
								label="Glassware"
								checked={options.includeGlassware}
								onChange={() => toggleOption("includeGlassware")}
							/>
						</div>
					</Grid>
				</fieldset>

				<RadioGroup
					name="format"
					legend="Format"
					options={FORMAT_OPTIONS}
					defaultValue={format}
					onChange={(event) => {
						if (isValidFormatOption(event.target.value)) {
							setFormat(event.target.value);
						}
					}}
				/>
			</Grid>

			<section className={styles.preview}>
				<header className={styles.previewHeader}>
					<Heading level="h5">Preview</Heading>

					<CopyToClipboard
						size="tiny"
						variant="ghost"
						color="light"
						getValue={() => preview}
						disabled={!preview}
						iconSize={1}
					>
						Copy
					</CopyToClipboard>
				</header>

				<div className={styles.previewContainer}>
					{isLoading ? (
						<Skeleton />
					) : (
						<Text as="pre" className={styles.previewContent}>
							{preview}
						</Text>
					)}
				</div>
			</section>
		</form>
	);
}

export function ExportListFormSkeleton() {
	return (
		<section className={styles.container}>
			<Grid gap={4} className={styles.options}>
				<Skeleton variant="text" width="9ch" height="20px" />

				<Grid gap={2}>
					<Skeleton variant="text" width="8ch" height="16px" />

					<div className={styles.checkboxes}>
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
					</div>
				</Grid>

				<Grid gap={2}>
					<Skeleton variant="text" width="8ch" height="16px" />

					<div className={styles.checkboxes}>
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
					</div>
				</Grid>

				<Grid gap={2}>
					<Skeleton variant="text" width="8ch" height="16px" />

					<div className={styles.checkboxes}>
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
					</div>
				</Grid>

				<Grid gap={2}>
					<Skeleton variant="text" width="8ch" height="16px" />

					<div className={styles.checkboxes}>
						<Skeleton variant="block" width="100%" height="20px" />
						<Skeleton variant="block" width="100%" height="20px" />
					</div>
				</Grid>
			</Grid>

			<section className={styles.preview}>
				<Skeleton variant="text" width="9ch" height="20px" />
				<Skeleton variant="block" width="100%" height="100%" />
			</section>
		</section>
	);
}

ExportListForm.Skeleton = ExportListFormSkeleton;
