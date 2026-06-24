const manager = (process.env.npm_config_user_agent ?? "").split("/")[0];

if (manager && manager !== "pnpm") {
	console.error(
		`\nThis repository uses pnpm — \`${manager} install\` breaks the hoisted layout and can't read \`catalog:\` deps. Run \`pnpm install\`.\n`,
	);
	process.exit(1);
}
