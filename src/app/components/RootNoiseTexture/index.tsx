export function RootNoiseTexture() {
	return (
		<>
			<svg aria-hidden="true">
				{/**
				 * biome-ignore lint/nursery/useUniqueElementIds: Must be global for use in CSS
				 */}
				<filter id="noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.99"
						numOctaves="3"
					/>
				</filter>
			</svg>

			<style>{":root { --noise-filter: url(#noise); }"}</style>
		</>
	);
}
