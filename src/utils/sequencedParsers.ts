export type Parser<T> = (remainder: string) => [T, remainder: string];

export type ExtractParserType<P> = P extends Parser<infer T> ? T : never;

/**
 * Tuple of inferred return types of the parser sequence
 */
type ParserSequenceResults<Parsers extends readonly Parser<unknown>[]> = {
	[K in keyof Parsers]: ExtractParserType<Parsers[K]>;
};

/**
 * @param parsers - Any number of parsers extending the `Parser` type.
 * @returns A function that takes a string and returns a tuple with the results of
 * the parsers.
 */
export function sequencedParsers<Parsers extends readonly Parser<unknown>[]>(
	...parsers: Parsers
): (text: string) => ParserSequenceResults<Parsers> {
	return (text: string) => {
		const results: unknown[] = [];

		let remainder = text;

		for (const parser of parsers) {
			const [value, newRemainder] = parser(remainder);
			results.push(value);
			remainder = newRemainder;
		}

		return results as ParserSequenceResults<Parsers>;
	};
}
