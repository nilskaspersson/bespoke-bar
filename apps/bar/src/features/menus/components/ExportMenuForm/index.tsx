"use client";

import type { Menu } from "@bespoke/schema/schema/menus";
import type { Keyed } from "@bespoke/schema/types";
import { Checkbox } from "@bespoke/ui/Checkbox";
import { CopyToClipboard } from "@bespoke/ui/CopyToClipboard";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { RadioGroup, type RadioGroupOption } from "@bespoke/ui/RadioGroup";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { handleKey } from "@bespoke/ui/utils/keyboard";
import { type FormEvent, use, useCallback, useMemo, useState } from "react";
import {
	type ExportOptions,
	exportMenuAsJson,
	exportMenuAsText,
	getExportFilename,
} from "@/features/menus/utils/exportMenu";
import { trpc } from "@/trpc/client";
import { downloadBlob } from "@/utils/downloadBlob";
import styles from "./styles.module.css";

type ExportFormat = "txt" | "json";

const DEFAULT_OPTIONS: ExportOptions = {
	includeMenuName: true,
	includeMenuDescription: true,
	includeName: true,
	includeDescription: true,
	includePrice: true,
	includeIngredients: true,
	includeMeasures: false,
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

export function ExportMenuForm({
	menu,
	formRef,
}: {
	menu: Pick<Menu, "id">;
	formRef?: React.RefObject<HTMLFormElement | null>;
}) {
	const [format, setFormat] = useState<ExportFormat>("txt");
	const [options, setOptions] = useState<ExportOptions>(DEFAULT_OPTIONS);

	const { currencyFormatter } = use(FormatterContext);

	const { data, isLoading } = trpc.menu.byId.useQuery({ id: menu.id });

	const preview = useMemo(() => {
		if (!data) return "";

		switch (format) {
			case "json":
				return JSON.stringify(exportMenuAsJson(data, options), null, 2);
			case "txt":
				return exportMenuAsText(data, options, currencyFormatter);
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
							Menu details
						</Text>

						<div className={styles.checkboxes}>
							<Checkbox
								label="Name"
								checked={options.includeMenuName}
								onChange={() => toggleOption("includeMenuName")}
							/>

							<Checkbox
								label="Description"
								checked={options.includeMenuDescription}
								onChange={() => toggleOption("includeMenuDescription")}
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
								label="Measures"
								checked={options.includeMeasures}
								onChange={() => toggleOption("includeMeasures")}
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

export function ExportMenuFormSkeleton() {
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

ExportMenuForm.Skeleton = ExportMenuFormSkeleton;
