import { type ComponentProps, use, useCallback, useMemo } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { Combobox } from "@/ui/Combobox";
import { OptionsList } from "@/ui/OptionsList";
import { Text } from "@/ui/Text";
import { collator } from "@/utils/collator";
import { type Keyed, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

type Currency = {
	code: string;
	name: string;
};

const itemToString = (item: Currency | null) => (!item ? "" : item.name);
const getItemValue = (item: Currency) => item.code;

export function SelectCurrency({
	...props
}: Omit<
	ComponentProps<typeof Combobox<Currency>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const { currencyDisplayName } = use(FormatterContext);

	const getItemLabel = useCallback((item: Currency) => {
		return (
			<OptionsList.Label>
				{item.name}

				<Text light className={styles.code} size={1}>
					{item.code}
				</Text>
			</OptionsList.Label>
		);
	}, []);

	const options: Keyed<Currency>[] = useMemo(() => {
		const currencies = Intl.supportedValuesOf("currency");

		return currencies
			.map((code) =>
				withKey({
					code,
					name: currencyDisplayName.of(code) ?? code,
				}),
			)
			.sort((a, b) => collator.compare(a.name, b.name));
	}, [currencyDisplayName]);

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
