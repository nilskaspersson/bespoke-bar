import {
	$applyNodeReplacement,
	type DOMConversionMap,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalNode,
	type NodeKey,
	type SerializedTextNode,
	type Spread,
	TextNode,
} from "lexical";
import type { TokenType } from "@/features/recipes/bulk/utils/tokenizeLine";

type SerializedRecipeTokenNode = Spread<
	{
		tokenType: TokenType;
		tokenValid: boolean;
		ingredientId: string | null;
	},
	SerializedTextNode
>;

export class RecipeTokenNode extends TextNode {
	__tokenType: TokenType;
	__tokenValid: boolean;
	__ingredientId: string | null;

	constructor(
		text: string,
		tokenType: TokenType,
		tokenValid: boolean,
		ingredientId: string | null,
		key?: NodeKey,
	) {
		super(text, key);
		this.__tokenType = tokenType;
		this.__tokenValid = tokenValid;
		this.__ingredientId = ingredientId;
	}

	static getType(): string {
		return "recipe-token";
	}

	static clone(node: RecipeTokenNode): RecipeTokenNode {
		return new RecipeTokenNode(
			node.__text,
			node.__tokenType,
			node.__tokenValid,
			node.__ingredientId,
			node.__key,
		);
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config);

		const themeTokens = (
			config.theme as { recipeTokens?: Record<string, string> }
		).recipeTokens;

		if (themeTokens) {
			const typeClass = themeTokens[this.__tokenType];
			if (typeClass) {
				dom.classList.add(typeClass);
			}

			if (!this.__tokenValid && themeTokens.invalid) {
				dom.classList.add(themeTokens.invalid);
			}

			if (
				this.__tokenType === "ingredient" &&
				this.__ingredientId &&
				themeTokens.known
			) {
				dom.classList.add(themeTokens.known);
				dom.dataset.ingredientId = this.__ingredientId;
			}
		}

		return dom;
	}

	updateDOM(
		prevNode: TextNode,
		dom: HTMLElement,
		config: EditorConfig,
	): boolean {
		if (prevNode instanceof RecipeTokenNode) {
			const needsRecreation =
				this.__tokenType !== prevNode.__tokenType ||
				this.__tokenValid !== prevNode.__tokenValid ||
				this.__ingredientId !== prevNode.__ingredientId;

			if (needsRecreation) {
				return true;
			}
		}

		return super.updateDOM(prevNode as this, dom, config);
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("span");
		element.textContent = this.__text;
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return null;
	}

	exportJSON(): SerializedRecipeTokenNode {
		return {
			...super.exportJSON(),
			type: "recipe-token",
			tokenType: this.__tokenType,
			tokenValid: this.__tokenValid,
			ingredientId: this.__ingredientId,
		};
	}

	static importJSON(json: SerializedRecipeTokenNode): RecipeTokenNode {
		return $createRecipeTokenNode(
			json.text,
			json.tokenType,
			json.tokenValid,
			json.ingredientId,
		);
	}

	getTokenType(): TokenType {
		return this.__tokenType;
	}

	getIngredientId(): string | null {
		return this.__ingredientId;
	}

	isTokenValid(): boolean {
		return this.__tokenValid;
	}
}

export function $createRecipeTokenNode(
	text: string,
	tokenType: TokenType,
	tokenValid: boolean,
	ingredientId: string | null,
): RecipeTokenNode {
	return $applyNodeReplacement(
		new RecipeTokenNode(text, tokenType, tokenValid, ingredientId),
	);
}

export function $isRecipeTokenNode(
	node: LexicalNode | null | undefined,
): node is RecipeTokenNode {
	return node instanceof RecipeTokenNode;
}
