import { type ComponentProps, useMemo } from "react";
import { Combobox } from "@/ui/Combobox";
import { OptionLabel } from "@/ui/OptionLabel";
import { Text } from "@/ui/Text";
import { collator } from "@/utils/collator";
import { SUPPORTED_LOCALES } from "@/utils/locales";
import { type Keyed, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

type Locale = {
	code: string;
	name: string;
};

const itemToString = (item: Locale | null) => (!item ? "" : item.name);
const getItemValue = (item: Locale) => item.code;

/**
 * Use static method with English. One could arguably show all listings in their
 * native names, but the app will be in English regardless.
 */
const intlLocaleDisplayName = new Intl.DisplayNames("en", { type: "language" });

const getItemLabel = (item: Locale) => (
	<OptionLabel>
		{item.name}

		<Text light className={styles.code} size={1}>
			{item.code}
		</Text>
	</OptionLabel>
);

export function SelectLocale({
	...props
}: Omit<
	ComponentProps<typeof Combobox<Locale>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const options: Keyed<Locale>[] = useMemo(() => {
		return SUPPORTED_LOCALES.map((code) =>
			withKey({
				code,
				name: intlLocaleDisplayName.of(code) ?? code,
			}),
		).sort((a, b) => collator.compare(a.name, b.name));
	}, []);

	return (
		<Combobox
			items={options}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			{...props}
		/>
	);
}
