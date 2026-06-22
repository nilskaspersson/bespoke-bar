declare module "*.module.css" {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module "*.css";

declare module "*.svg" {
	const content: { src: string; height: number; width: number };
	export default content;
}
